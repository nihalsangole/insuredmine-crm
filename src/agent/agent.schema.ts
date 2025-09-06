import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Agent extends Document {
  @Prop({ required: true })
  agentName: string;
}

export const AgentSchema = SchemaFactory.createForClass(Agent);
