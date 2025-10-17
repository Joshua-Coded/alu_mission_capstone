import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema } from "mongoose";
import { UserRole } from "../../common/enums/user-role.enum";

export enum GovernmentDepartment {
  POULTRY = 'POULTRY',
  CROPS = 'CROPS',
  LIVESTOCK = 'LIVESTOCK',
  FISHERIES = 'FISHERIES',
  HORTICULTURE = 'HORTICULTURE',
  AGRIBUSINESS = 'AGRIBUSINESS',
  SUSTAINABILITY = 'SUSTAINABILITY',
  COMPLIANCE = 'COMPLIANCE',
  GENERAL = 'GENERAL'
}

export enum ProjectCategory {
  POULTRY_FARMING = 'POULTRY_FARMING',
  CROP_PRODUCTION = 'CROP_PRODUCTION',
  LIVESTOCK_FARMING = 'LIVESTOCK_FARMING',
  FISH_FARMING = 'FISH_FARMING',
  VEGETABLE_FARMING = 'VEGETABLE_FARMING',
  FRUIT_FARMING = 'FRUIT_FARMING',
  AGRO_PROCESSING = 'AGRO_PROCESSING',
  SUSTAINABLE_AGRICULTURE = 'SUSTAINABLE_AGRICULTURE',
  ORGANIC_FARMING = 'ORGANIC_FARMING',
  GENERAL_AGRICULTURE = 'GENERAL_AGRICULTURE'
}

export type UserDocument = User & Document;

@Schema({ 
  timestamps: true,
  toJSON: {
    transform: (_doc: any, ret: any) => {
      if (ret.password) delete ret.password;
      if (ret.emailVerificationToken) delete ret.emailVerificationToken;
      if (ret.passwordResetToken) delete ret.passwordResetToken;
      if (ret.__v !== undefined) delete ret.__v;
      ret.id = ret._id?.toString();
      return ret;
    },
    versionKey: false
  },
  toObject: {
    transform: (_doc: any, ret: any) => {
      if (ret.password) delete ret.password;
      if (ret.emailVerificationToken) delete ret.emailVerificationToken;
      if (ret.passwordResetToken) delete ret.passwordResetToken;
      if (ret.__v !== undefined) delete ret.__v;
      ret.id = ret._id?.toString();
      return ret;
    },
    versionKey: false
  }
})
export class User {
  _id?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true })
  lastName: string;

  @Prop({ required: true, trim: true })
  phoneNumber: string;

  @Prop({ required: true, enum: Object.values(UserRole), type: String })
  role: UserRole;

  @Prop({ type: [{ type: String, enum: Object.values(UserRole) }], default: [] })
  roles: UserRole[];

  @Prop({ 
    enum: Object.values(GovernmentDepartment),
    type: String,
    default: GovernmentDepartment.GENERAL
  })
  department: GovernmentDepartment;

  @Prop({ 
    type: [{ type: String, enum: Object.values(ProjectCategory) }], 
    default: [] 
  })
  specializations: ProjectCategory[];

  @Prop({ 
    unique: true, 
    lowercase: true, 
    sparse: true,
    type: String
  })
  walletAddress?: string;

  @Prop({ default: true, type: Boolean })
  isActive: boolean;

  @Prop({ default: false, type: Boolean })
  emailVerified: boolean;

  @Prop({ type: String })
  emailVerificationToken?: string;

  @Prop({ type: MongooseSchema.Types.Date })
  emailVerificationTokenExpires?: Date;

  @Prop({ type: String })
  passwordResetToken?: string;

  @Prop({ type: MongooseSchema.Types.Date })
  passwordResetTokenExpires?: Date;

  @Prop({ type: String })
  profileImage?: string; 

  @Prop({ type: MongooseSchema.Types.Date })
  lastLogin?: Date;

  @Prop({ type: String })
  mobileMoneyAccount?: string;

  @Prop({ type: String })
  location?: string;

  @Prop({ type: String })
  bio?: string;

  @Prop({ default: 0, type: Number })
  currentWorkload: number;

  @Prop({ default: 10, type: Number })
  maxWorkload: number;

  @Prop({ default: 0, type: Number })
  projectsReviewed: number;

  @Prop({ default: 0, type: Number })
  projectsApproved: number;

  @Prop({ default: 0, type: Number })
  averageProcessingTime: number;

  @Prop({ type: MongooseSchema.Types.Date, default: () => new Date() })
  createdAt: Date;

  @Prop({ type: MongooseSchema.Types.Date, default: () => new Date() })
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// ✅ Proper indexes (removed duplicates)
UserSchema.index({ role: 1 });
UserSchema.index({ role: 1, isActive: 1, emailVerified: 1 });
UserSchema.index({ department: 1 });
UserSchema.index({ specializations: 1 });
UserSchema.index({ currentWorkload: 1 });
UserSchema.index({ emailVerificationToken: 1 });
UserSchema.index({ passwordResetToken: 1 });
UserSchema.index({ role: 1, department: 1 });