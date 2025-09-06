import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ScheduledMessage } from './scheduledMessage.schema';
import { RabbitMQService } from '../common/rabbitmq/rabbitmq.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectModel(ScheduledMessage.name)
    private scheduledMessageModel: Model<ScheduledMessage>,
    private rabbitMQService: RabbitMQService,
  ) {}

  // run every 5 minutes to check for upcoming jobs
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkUpcomingJobs() {
    this.logger.log('Checking for upcoming scheduled messages...');

    try {
      const now = new Date();
      const nextHours = new Date(now.getTime() + 4 * 60 * 60 * 1000); // next 4 hours

      // find pending messages scheduled within next 4 hours (including past due messages)
      const upcomingMessages = await this.scheduledMessageModel
        .find({
          status: 'pending',
          scheduledTime: {
            $lte: nextHours,
          },
        })
        .sort({ scheduledTime: 1 });

      this.logger.log(`Found ${upcomingMessages.length} upcoming messages`);

      for (const message of upcomingMessages) {
        await this.scheduleMessageForProcessing(message);
      }
    } catch (error) {
      this.logger.error('Error checking upcoming jobs:', error);
    }
  }

  private async scheduleMessageForProcessing(scheduledMessage: any) {
    try {
      const now = new Date();
      const scheduledTime = new Date(scheduledMessage.scheduledTime);
      const delayMs = scheduledTime.getTime() - now.getTime();

      if (delayMs <= 0) {
        // message is due now, process immediately
        this.logger.log(
          `Processing immediate message: ${scheduledMessage._id}`,
        );
        await this.rabbitMQService.publishMessage({
          scheduledMessageId: scheduledMessage._id.toString(),
          message: scheduledMessage.message,
          scheduledTime: scheduledMessage.scheduledTime,
          priority: scheduledMessage.priority || 3,
        });
      } else {
        // message is in the future, schedule with delay
        this.logger.log(
          `Scheduling message ${scheduledMessage._id} for ${delayMs}ms from now`,
        );
        await this.rabbitMQService.publishMessage(
          {
            scheduledMessageId: scheduledMessage._id.toString(),
            message: scheduledMessage.message,
            scheduledTime: scheduledMessage.scheduledTime,
            priority: scheduledMessage.priority || 3,
          },
          delayMs,
        );
      }

      // mark as queued
      await this.scheduledMessageModel.findByIdAndUpdate(scheduledMessage._id, {
        status: 'queued',
        queuedAt: new Date(),
      });
    } catch (error) {
      this.logger.error(
        `Error scheduling message ${scheduledMessage._id}:`,
        error,
      );

      // mark as failed
      await this.scheduledMessageModel.findByIdAndUpdate(scheduledMessage._id, {
        status: 'failed',
        lastError: error.message,
        failedAt: new Date(),
      });
    }
  }

  // manual trigger for testing
  async triggerScheduler() {
    this.logger.log('Manual scheduler trigger');
    await this.checkUpcomingJobs();
    return { message: 'Scheduler triggered successfully' };
  }

  // get scheduler stats
  async getSchedulerStats() {
    const stats = await this.scheduledMessageModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const total = await this.scheduledMessageModel.countDocuments();

    return {
      total,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      lastChecked: new Date(),
    };
  }
}
