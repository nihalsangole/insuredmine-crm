import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class PolicyCarrier extends Document {
  @Prop({ required: true })
  companyName: string;
}

export const PolicyCarrierSchema = SchemaFactory.createForClass(PolicyCarrier);
