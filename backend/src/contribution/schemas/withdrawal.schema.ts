import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";

// Export the document type
export type WithdrawalDocument = Withdrawal & Document;

// Export the enums
export enum WithdrawalStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum PaymentMethod {
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
}

// Export the class
@Schema({ timestamps: true })
export class Withdrawal {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  farmer: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project', required: true })
  project: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  blockchainProjectId: number;

  @Prop({ required: true })
  farmerWallet: string;

  @Prop({ required: true })
  amountEth: number;

  @Prop({ required: true })
  amountWei: string;

  @Prop({ required: true })
  ethToRwfRate: number;

  @Prop({ required: true })
  amountRwf: number;

  @Prop({ 
    type: String, 
    enum: PaymentMethod, 
    default: PaymentMethod.MOBILE_MONEY 
  })
  paymentMethod: PaymentMethod;

  @Prop({ required: true })
  recipientPhone?: string;

  @Prop()
  recipientBankAccount?: string;

  @Prop()
  recipientBankName?: string;

  @Prop()
  recipientName?: string;

  @Prop({ 
    type: String, 
    enum: WithdrawalStatus, 
    default: WithdrawalStatus.PENDING 
  })
  status: WithdrawalStatus;

  @Prop()
  blockchainTxHash?: string;

  @Prop()
  paymentReference?: string;

  @Prop()
  processedBy?: string;

  @Prop({ default: Date.now })
  requestedAt: Date;

  @Prop()
  processedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  failureReason?: string;

  @Prop({ default: 0 })
  transactionFee: number;

  @Prop()
  finalAmountRwf?: number;

  @Prop({ type: Object })
  metadata?: {
    projectTitle?: string;
    notes?: string;
    ipAddress?: string;
  };
}

// Export the schema
export const WithdrawalSchema = SchemaFactory.createForClass(Withdrawal);

// Indexes
WithdrawalSchema.index({ farmer: 1, createdAt: -1 });
WithdrawalSchema.index({ project: 1 });
WithdrawalSchema.index({ status: 1, createdAt: -1 });
WithdrawalSchema.index({ blockchainProjectId: 1 });
WithdrawalSchema.index({ paymentReference: 1 }, { unique: true, sparse: true });