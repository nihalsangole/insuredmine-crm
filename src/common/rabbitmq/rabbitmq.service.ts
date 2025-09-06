import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobLog } from 'src/message/jobLog.schema';
import { ScheduledMessage } from 'src/message/scheduledMessage.schema';
import { Message } from 'src/message/message.schema';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: any = null;
  private channel: any = null;

  constructor(
    @InjectModel(ScheduledMessage.name)
    private scheduledMessageModel: Model<ScheduledMessage>,
    @InjectModel(Message.name)
    private mainMessageModel: Model<Message>,
    @InjectModel(JobLog.name)
    private jobLogModel: Model<JobLog>,
  ) {}

  async connect() {
    try {
      this.connection = await amqp.connect(
        process.env.RABBITMQ_URL || 'amqp://localhost',
      );

      this.channel = await this.connection.createChannel();

      if (this.channel) {
        // main processing queue
        await this.channel.assertQueue('message_queue', { durable: true });

        // delayed message queue with TTL and dead letter exchange
        await this.channel.assertQueue('message_delayed_queue', {
          durable: true,
          arguments: {
            'x-message-ttl': 3600000, // max 1 hour TTL
            'x-dead-letter-exchange': '',
            'x-dead-letter-routing-key': 'message_queue',
          },
        });
      }
      this.logger.log('Connected to RabbitMQ with delayed message support');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
    }
  }

  async publishMessage(message: any, delay?: number) {
    try {
      if (!this.channel) {
        await this.connect();
      }

      if (!this.channel) {
        // fallback: process message directly without rabbitmq
        this.logger.warn('RabbitMQ not available, processing message directly');
        if (delay) {
          // for delayed messages, wait and then process
          setTimeout(async () => {
            await this.processMessage(message);
          }, delay);
        } else {
          // process immediately
          await this.processMessage(message);
        }
        return;
      }

      const messageBuffer = Buffer.from(JSON.stringify(message));

      if (delay && delay > 0) {
        // publish to delayed queue with TTL
        await this.channel.publish('', 'message_delayed_queue', messageBuffer, {
          persistent: true,
          expiration: delay.toString(),
        });
        this.logger.log(
          `Message published to delayed queue with ${delay}ms TTL`,
        );
      } else {
        // publish immediately to main queue
        await this.channel.publish('', 'message_queue', messageBuffer, {
          persistent: true,
        });
        this.logger.log('Message published to main queue');
      }
    } catch (error) {
      this.logger.error('Failed to publish message:', error);
      // fallback: process message directly
      this.logger.warn('RabbitMQ failed, processing message directly');
      try {
        if (delay) {
          setTimeout(async () => {
            await this.processMessage(message);
          }, delay);
        } else {
          await this.processMessage(message);
        }
      } catch (fallbackError) {
        this.logger.error('Fallback processing also failed:', fallbackError);
        throw error; // throw original error
      }
    }
  }

  async consumeMessages() {
    try {
      if (!this.channel) {
        await this.connect();
      }

      if (!this.channel) {
        throw new Error('Failed to create channel');
      }

      await this.channel.consume('message_queue', async (msg) => {
        if (msg && this.channel) {
          try {
            const messageData = JSON.parse(msg.content.toString());

            await this.processMessage(messageData);
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error('Error processing message:', error);
            this.channel.nack(msg, false, false); // Don't requeue
          }
        }
      });

      this.logger.log('Started consuming messages from RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to start consuming messages:', error);
      throw error;
    }
  }

  // start consumer on module initialization
  async onModuleInit() {
    try {
      await this.consumeMessages();
    } catch (error) {
      this.logger.error('Failed to start consumer on module init:', error);
    }
  }

  private async processMessage(messageData: any) {
    const { scheduledMessageId, message, scheduledTime } = messageData;

    try {
      const now = new Date();

      const scheduled = new Date(scheduledTime);

      if (now < scheduled) {
        // not time yet, requeue with delay

        const delay = scheduled.getTime() - now.getTime();

        await this.publishMessage(messageData, delay);
        return;
      }

      // time to send the message
      await this.sendMessage(scheduledMessageId, message);

      // update scheduled message status

      await this.scheduledMessageModel.findByIdAndUpdate(scheduledMessageId, {
        status: 'completed',
        completedAt: new Date(),
      });

      // log success

      await this.logJob(
        'rabbitmq_worked',
        'success',
        'message processed Succesfully',
        undefined,
        1,
        0,
      );
    } catch (error: any) {
      this.logger.error('Error processing message:', error);

      // update scheduled message status to failed
      await this.scheduledMessageModel.findByIdAndUpdate(scheduledMessageId, {
        status: 'failed',
        lastError: error.message,
        retryCount: (messageData.retryCount || 0) + 1,
      });

      await this.logJob(
        'rabbitmq_worker',
        'failed',
        'Message processing failed',
        error.message,
        0,
        1,
      );
    }
  }

  private async sendMessage(scheduledMessageId: string, message: string) {
    const mainMessage = new this.mainMessageModel({
      message,
      scheduledMessageId,
      status: 'sent',
      sentAt: new Date(),
    });

    await mainMessage.save();

    this.logger.log(`message sent:${mainMessage}`);
  }

  private async logJob(
    jobType: string,
    status: string,
    message: string,
    error?: string,
    processedCount?: number,
    failedCount?: number,
    executionTime?: number,
  ) {
    const JobLog = new this.jobLogModel({
      jobType,
      status,
      message,
      error,
      processedCount,
      failedCount,
      executionTime,
    });

    await JobLog.save();
  }

  async close() {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}
