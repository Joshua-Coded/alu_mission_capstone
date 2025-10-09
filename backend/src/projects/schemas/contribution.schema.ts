import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ContributionDocument = Contribution & Document;

@Schema({ timestamps: true })
export class Contribution {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  project: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  contributor: Types.ObjectId;

  @Prop({ required: true })
  contributorWallet: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  transactionHash: string;

  @Prop({
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  })
  status: string;

  @Prop()
  blockNumber: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ContributionSchema = SchemaFactory.createForClass(Contribution);