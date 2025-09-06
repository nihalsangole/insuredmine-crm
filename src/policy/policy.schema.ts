import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class PolicyInfo extends Document {
  @Prop({ required: true })
  policyNumber: string;

  @Prop({ required: true })
  policyStartDate: Date;

  @Prop({ required: true })
  policyEndDate: Date;

  @Prop({ required: true, type: Types.ObjectId, ref: 'PolicyCategory' })
  policyCategoryId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'PolicyCarrier' })
  companyId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;
}

export const PolicyInfoSchema = SchemaFactory.createForClass(PolicyInfo);
