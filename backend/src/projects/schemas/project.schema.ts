import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { GovernmentDepartment } from "src/common/enums/government-department.enum";

// Update the ProjectDocument type to include _id
export type ProjectDocument = Project & Document & {
  _id: Types.ObjectId;
};

class DueDiligenceDocument {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ default: Date.now })
  uploadedAt: Date;
}

class DueDiligence {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  })
  status: string;

  @Prop({ default: '' })
  notes: string;

  @Prop({ type: [DueDiligenceDocument], default: [] })
  documents: DueDiligenceDocument[];

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;
}

class Verification {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy?: Types.ObjectId;

  @Prop()
  verifiedAt?: Date;

  @Prop({ default: '' })
  documentHash: string;

  @Prop({ default: '' })
  blockchainTxHash: string;

  @Prop({ default: '' })
  rejectionReason: string;
}

class ProjectDocumentItem {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  documentType: string;

  @Prop({ default: Date.now })
  uploadedAt: Date;
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, unique: true })
  projectId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  farmer: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  fundingGoal: number;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  timeline: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [ProjectDocumentItem], default: [] })
  documents: ProjectDocumentItem[];

  @Prop({
    type: String,
    enum: Object.values(GovernmentDepartment),
    default: GovernmentDepartment.GENERAL
  })
  department: GovernmentDepartment;

  @Prop({
    type: String,
    enum: ['submitted', 'under_review', 'verified', 'active', 'funded', 'rejected', 'closed'],
    default: 'submitted'
  })
  status: string;

  @Prop({ type: Number, default: null })
  blockchainProjectId: number;

  @Prop({
    type: String,
    enum: ['not_created', 'pending', 'created', 'failed'],
    default: 'not_created'
  })
  blockchainStatus: string;

  @Prop({ default: '' })
  blockchainTxHash: string;

  @Prop()
  blockchainCreatedAt: Date;

  @Prop({ default: 0 })
  milestonesCompleted: number;

  @Prop({ default: 0 })
  totalMilestones: number;

  @Prop({ type: Boolean, default: false })
  isBlockchainFunded: boolean;

  @Prop({ type: Date })
  blockchainFundedAt: Date;

  @Prop({ type: Date, default: Date.now })
  submittedAt: Date;

  @Prop({ type: DueDiligence, default: {} })
  dueDiligence: DueDiligence;

  @Prop({ type: Verification, default: {} })
  verification: Verification;

  @Prop({ default: 0 })
  currentFunding: number;

  @Prop({ default: 0 })
  contributorsCount: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  favoritedBy: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  contributors: Types.ObjectId[];

  @Prop({ type: Object, default: {} })
  metadata: {
    views: number;
    shares: number;
    lastViewed: Date;
  };
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Indexes
ProjectSchema.index({ farmer: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ department: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ location: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ fundingGoal: 1 });
ProjectSchema.index({ 'dueDiligence.assignedTo': 1 });
ProjectSchema.index({ 'verification.verifiedBy': 1 });

// Virtuals
ProjectSchema.virtual('fundingProgress').get(function() {
  return this.fundingGoal > 0 ? (this.currentFunding / this.fundingGoal) * 100 : 0;
});

// Instance methods
ProjectSchema.methods.isFunded = function(): boolean {
  return this.currentFunding >= this.fundingGoal;
};

ProjectSchema.methods.canBeEdited = function(): boolean {
  return this.status === 'submitted';
};

ProjectSchema.methods.canBeDeleted = function(): boolean {
  return this.status === 'submitted';
};

ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });