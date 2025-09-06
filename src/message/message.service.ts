import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RabbitMQService } from 'src/common/rabbitmq/rabbitmq.service';
import { CronService } from './cron.service';
import { JobLog } from './jobLog.schema';
import { ScheduledMessage } from './scheduledMessage.schema';
import { Message } from './message.schema';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectModel(ScheduledMessage.name)
    private scheduledMessageModel: Model<ScheduledMessage>,
    @InjectModel(Message.name)
    private MessageModel: Model<Message>,
    @InjectModel(JobLog.name)
    private jobLogModel: Model<JobLog>,
    private rabbitMQService: RabbitMQService,
    private cronService: CronService,
  ) {}

  // new hybrid approach - store message and let cron job handle scheduling
  async scheduleMessage(
    message: string,
    scheduledTime: Date,
    userId?: string,
    priority?: number,
  ) {
    try {
      const newMessage = new this.scheduledMessageModel({
        message,
        scheduledTime,
        userId,
        priority: priority || 3, // default to low priorty
        status: 'pending',
      });

      const savedMessage = await newMessage.save();
      this.logger.log(
        `Message scheduled for ${scheduledTime.toISOString()}: ${message}`,
      );

      return savedMessage;
    } catch (error) {
      this.logger.error('Error scheduling message:', error);
      throw error;
    }
  }

  // legacy method for backward compatibility
  async scheduleMessageLegacy(message: string, day: string, time: string) {
    try {
      // convert day and time to scheduled time
      const scheduledTime = this.convertDayTimeToDate(day, time);
      return await this.scheduleMessage(message, scheduledTime);
    } catch (error) {
      this.logger.error('Error scheduling legacy message:', error);
      throw error;
    }
  }

  private convertDayTimeToDate(day: string, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const dayMap: { [key: string]: number } = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };

    const dayNumber = dayMap[day.toLowerCase()];
    if (dayNumber === undefined) {
      throw new Error(`Invalid day: ${day}`);
    }

    const now = new Date();
    const targetDate = new Date();
    targetDate.setHours(hours, minutes, 0, 0);

    // find the next occurance of this day
    const currentDay = now.getDay();
    const daysUntilTarget = (dayNumber - currentDay + 7) % 7;

    if (daysUntilTarget === 0 && targetDate <= now) {
      // if its the same day but time has passed, schedule for next week
      targetDate.setDate(targetDate.getDate() + 7);
    } else {
      targetDate.setDate(targetDate.getDate() + daysUntilTarget);
    }

    return targetDate;
  }

  async getAllScheduledMessages() {
    return this.scheduledMessageModel.find().sort({ scheduledTime: 1 });
  }

  async getScheduledMessageById(id: string) {
    return this.scheduledMessageModel.findById(id);
  }

  async updateScheduledMessage(id: string, updateData: any) {
    return this.scheduledMessageModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }

  async cancelScheduledMessage(id: string) {
    return this.scheduledMessageModel.findByIdAndUpdate(
      id,
      { status: 'cancelled' },
      { new: true },
    );
  }

  async deleteScheduledMessage(id: string) {
    return this.scheduledMessageModel.findByIdAndDelete(id);
  }

  async getAllMessages() {
    return this.MessageModel.find().sort({ sentAt: -1 });
  }

  async getMessageById(id: string) {
    return this.MessageModel.findById(id);
  }

  async getJobLogs(jobType?: string, limit: number = 100) {
    const query = jobType ? { jobType } : {};
    return this.jobLogModel.find(query).sort({ createdAt: -1 }).limit(limit);
  }

  // manual trigger for testing
  async triggerCronJob() {
    return this.cronService.triggerCronJob();
  }

  // get message statistics
  async getMessageStats() {
    const stats = await this.scheduledMessageModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const totalScheduled = await this.scheduledMessageModel.countDocuments();
    const totalMain = await this.MessageModel.countDocuments();

    return {
      scheduled: stats,
      totalScheduled,
      totalMain,
    };
  }

  // retry failed messages
  async retryFailedMessages() {
    const failedMessages = await this.scheduledMessageModel.find({
      status: 'failed',
      retryCount: { $lt: 3 }, // max 3 retrys
    });

    let retriedCount = 0;
    for (const message of failedMessages) {
      try {
        // reset status to pending for retry
        await this.scheduledMessageModel.findByIdAndUpdate(message._id, {
          status: 'pending',
          lastError: null,
        });
        retriedCount++;
      } catch (error) {
        this.logger.error(
          `Error retrying message ${(message._id as any).toString()}:`,
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    this.logger.log(`Retried ${retriedCount} failed messages`);
    return { retriedCount };
  }
}
