import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

export type ContributionDocument = Contribution & Document;

export enum ContributionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
}

export enum TransactionType {
  CONTRIBUTION = 'contribution',
  WITHDRAWAL = 'withdrawal',
  REFUND = 'refund',
}

@Schema({ timestamps: true })
export class Contribution {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  contributor: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  project: MongooseSchema.Types.ObjectId;

  // Blockchain data
  @Prop({ required: true })
  blockchainProjectId: number;

  @Prop({ required: true })
  farmerWalletAddress: string; // Where funds will go after completion

  @Prop({ required: true })
  amountMatic: number;

  @Prop({ required: true })
  amountWei: string;

  // RWF conversion (at time of contribution)
  @Prop()
  maticToRwfRate?: number;

  @Prop()
  amountRwf?: number;

  @Prop()
  transactionHash?: string;

  @Prop({ 
    type: String, 
    enum: ContributionStatus, 
    default: ContributionStatus.PENDING 
  })
  status: ContributionStatus;

  @Prop({ 
    type: String, 
    enum: TransactionType, 
    default: TransactionType.CONTRIBUTION 
  })
  transactionType: TransactionType;

  @Prop()
  blockNumber?: number;

  @Prop()
  gasUsed?: string;

  @Prop()
  gasFee?: string;

  @Prop({ default: Date.now })
  contributedAt: Date;

  @Prop()
  confirmedAt?: Date;

  @Prop()
  failureReason?: string;

  @Prop({ type: Object })
  metadata?: {
    projectTitle?: string;
    farmerName?: string;
    contributorName?: string;
    anonymous?: boolean;
    notes?: string;
  };
}

export const ContributionSchema = SchemaFactory.createForClass(Contribution);

// Indexes
ContributionSchema.index({ contributor: 1, createdAt: -1 });
ContributionSchema.index({ project: 1, status: 1 });
ContributionSchema.index({ transactionHash: 1 }, { unique: true, sparse: true });
ContributionSchema.index({ blockchainProjectId: 1 });
ContributionSchema.index({ status: 1, createdAt: -1 });