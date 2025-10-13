import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

// schemas/project.schema.ts

export type ProjectDocument = Project & Document;

class DueDiligenceDocument {
  name: string;
  url: string;
  uploadedAt: Date;
}

class DueDiligence {
  assignedTo?: Types.ObjectId;
  status: string;
  notes: string;
  documents: DueDiligenceDocument[];
  startedAt?: Date;
  completedAt?: Date;
}

class Verification {
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
  documentHash: string;
  blockchainTxHash: string;
  rejectionReason: string;
}

class ProjectDocumentItem {
  name: string;
  url: string;
  documentType: string;
  uploadedAt: Date;
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, unique: true })
  projectId: string;

  @Prop({ type: Number, default: null })
  blockchainProjectId: number;

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

  @Prop({ type: [Object], default: [] })
  documents: ProjectDocumentItem[];

  @Prop({
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'verified', 'active', 'funded', 'rejected', 'closed'],
    default: 'draft'
  })
  status: string;

  @Prop({ type: Object, default: {} })
  dueDiligence: DueDiligence;

  @Prop({ type: Object, default: {} })
  verification: Verification;

  @Prop({ default: 0 })
  currentFunding: number;

  @Prop({ default: 0 })
  contributorsCount: number;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);