import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Message extends Document {
  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  scheduledMessageId: string;

  @Prop({ required: false })
  userId?: string;

  @Prop({
    default: 'sent',
    enum: ['sent', 'failed', 'delivered'],
    type: String,
  })
  status: string;

  @Prop({ required: false })
  sentAt?: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
