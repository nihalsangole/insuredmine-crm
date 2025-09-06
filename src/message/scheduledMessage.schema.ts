import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class ScheduledMessage extends Document {
  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  scheduledTime: Date;

  @Prop({
    type: String,
    enum: ['pending', 'queued', 'completed', 'failed'],
    default: 'pending',
  })
  status: string;

  @Prop({ required: false })
  userId: string;

  @Prop({ required: false, default: 3 })
  priority: number;

  @Prop({ required: false })
  queuedAt?: Date;

  @Prop({ required: false })
  retryCount: number;

  @Prop({ required: false })
  lastError: string;

  @Prop({ required: false })
  CompletedAt: Date;
}

export const ScheduledMessageSchema =
  SchemaFactory.createForClass(ScheduledMessage);
