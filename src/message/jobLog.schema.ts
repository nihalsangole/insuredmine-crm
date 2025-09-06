import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class JobLog extends Document {
  @Prop({ required: true })
  jobType: string; // 'daily_cron'

  @Prop({ required: true })
  status: string; // 'success', 'failed', 'warning'

  @Prop({ required: false })
  message?: string; // log message

  @Prop({ required: false })
  error?: string; // error details

  @Prop({ required: false })
  processedCount?: number; // how many messages processed

  @Prop({ required: false })
  failedCount?: number; // how many messages failed

  @Prop({ required: false })
  executionTime?: number; // execution time in ms
}

export const JobLogSchema = SchemaFactory.createForClass(JobLog);
