import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as cron from 'node-cron';
import { ScheduledMessage } from './scheduledMessage.schema';
import { JobLog } from './jobLog.schema';
import { RabbitMQService } from 'src/common/rabbitmq/rabbitmq.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    @InjectModel(ScheduledMessage.name)
    private scheduledMessageModel: Model<ScheduledMessage>,
    @InjectModel(JobLog.name)
    private jobLogModel: Model<JobLog>,
    private rabbitMQService: RabbitMQService,
  ) {}

  startCronJobs() {
    // daily cron job that runs every morning at 6 AM
    cron.schedule('0 6 * * *', async () => {
      await this.processScheduledMessages();
    });

    // also run every hour to catch any missed messages
    cron.schedule('0 * * * *', async () => {
      await this.processScheduledMessages();
    });

    this.logger.log('Cron jobs started');
  }

  private async processScheduledMessages() {
    const startTime = Date.now();
    let processedCount = 0;
    let failedCount = 0;

    try {
      this.logger.log('Starting daily cron job for scheduled messages');

      // get all pending messages for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const scheduledMessages = await this.scheduledMessageModel.find({
        status: 'pending',
        scheduledTime: {
          $gte: today,
          $lt: tomorrow,
        },
      });

      this.logger.log(
        `Found ${scheduledMessages.length} scheduled messages for today`,
      );

      for (const message of scheduledMessages) {
        try {
          // check if message should be queued now or later
          const now = new Date();
          const scheduledTime = new Date(message.scheduledTime);

          if (now >= scheduledTime) {
            // message is ready to be sent now
            await this.queueMessage(message);
            processedCount++;
          } else {
            // message should be sent later, queue with delay
            const delay = scheduledTime.getTime() - now.getTime();
            await this.queueMessageWithDelay(message, delay);
            processedCount++;
          }

          // update status to queued
          await this.scheduledMessageModel.findByIdAndUpdate(message._id, {
            status: 'queued',
          });
        } catch (error) {
          this.logger.error(`Error processing message ${message._id}:`, error);
          failedCount++;

          // update message status to failed
          await this.scheduledMessageModel.findByIdAndUpdate(message._id, {
            status: 'failed',
            lastError: error.message,
            retryCount: (message.retryCount || 0) + 1,
          });
        }
      }

      // log job completion
      const executionTime = Date.now() - startTime;
      await this.logJob(
        'daily_cron',
        'success',
        `Processed ${processedCount} messages, ${failedCount} failed`,
        undefined,
        processedCount,
        failedCount,
        executionTime,
      );

      this.logger.log(
        `Daily cron job completed. Processed: ${processedCount}, Failed: ${failedCount}`,
      );
    } catch (error) {
      this.logger.error('Daily cron job failed:', error);

      const executionTime = Date.now() - startTime;
      await this.logJob(
        'daily_cron',
        'failed',
        'Daily cron job failed',
        error.message,
        processedCount,
        failedCount,
        executionTime,
      );
    }
  }

  private async queueMessage(message: ScheduledMessage) {
    const messageData = {
      scheduledMessageId: (message._id as any).toString(),
      message: message.message,
      scheduledTime: message.scheduledTime,
      userId: message.userId,
    };

    await this.rabbitMQService.publishMessage(messageData);
    this.logger.log(`Message ${message._id} queued for immediate processing`);
  }

  private async queueMessageWithDelay(
    message: ScheduledMessage,
    delay: number,
  ) {
    const messageData = {
      scheduledMessageId: (message._id as any).toString(),
      message: message.message,
      scheduledTime: message.scheduledTime,
      userId: message.userId,
    };

    await this.rabbitMQService.publishMessage(messageData, delay);
    this.logger.log(`Message ${message._id} queued with ${delay}ms delay`);
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
    const jobLog = new this.jobLogModel({
      jobType,
      status,
      message,
      error,
      processedCount,
      failedCount,
      executionTime,
    });

    await jobLog.save();
  }

  // method to manualy trigger cron job (for testing)
  async triggerCronJob() {
    await this.processScheduledMessages();
  }
}
