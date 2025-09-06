import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class PolicyCategory extends Document {
  @Prop({ required: true })
  categoryName: string;
}

export const PolicyCategorySchema =
  SchemaFactory.createForClass(PolicyCategory);
