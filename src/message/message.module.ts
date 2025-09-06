import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { Message, MessageSchema } from './message.schema';
import {
  ScheduledMessage,
  ScheduledMessageSchema,
} from './scheduledMessage.schema';
import { JobLog, JobLogSchema } from './jobLog.schema';
import { RabbitMQService } from '../common/rabbitmq/rabbitmq.service';
import { CronService } from './cron.service';
import { SchedulerService } from './scheduler.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: ScheduledMessage.name, schema: ScheduledMessageSchema },
      { name: JobLog.name, schema: JobLogSchema },
    ]),
  ],
  controllers: [MessageController],
  providers: [MessageService, RabbitMQService, CronService, SchedulerService],
  exports: [MessageService, RabbitMQService, SchedulerService],
})
export class MessageModule {}
