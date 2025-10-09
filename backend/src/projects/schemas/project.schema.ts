import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ProjectDocument = Project & Document;

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

  @Prop()
  duration: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({
    type: [{
      name: String,
      url: String,
      documentType: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    default: []
  })
  documents: {
    name: string;
    url: string;
    documentType: string;
    uploadedAt: Date;
  }[];

  @Prop({
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'verified', 'active', 'funded', 'rejected', 'closed'],
    default: 'draft'
  })
  status: string;

  @Prop({
    type: {
      assignedTo: { type: Types.ObjectId, ref: 'User', default: null },
      status: {
        type: String,
        enum: ['pending', 'in_progress', 'completed'],
        default: 'pending'
      },
      notes: { type: String, default: '' },
      documents: {
        type: [{
          name: String,
          url: String,
          uploadedAt: { type: Date, default: Date.now }
        }],
        default: []
      },
      startedAt: { type: Date, default: null },
      completedAt: { type: Date, default: null }
    },
    default: {}
  })
  dueDiligence: {
    assignedTo: Types.ObjectId;
    status: string;
    notes: string;
    documents: {
      name: string;
      url: string;
      uploadedAt: Date;
    }[];
    startedAt: Date;
    completedAt: Date;
  };

  @Prop({
    type: {
      verifiedBy: { type: Types.ObjectId, ref: 'User', default: null },
      verifiedAt: { type: Date, default: null },
      documentHash: { type: String, default: '' },
      blockchainTxHash: { type: String, default: '' },
      rejectionReason: { type: String, default: '' }
    },
    default: {}
  })
  verification: {
    verifiedBy: Types.ObjectId;
    verifiedAt: Date;
    documentHash: string;
    blockchainTxHash: string;
    rejectionReason: string;
  };

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