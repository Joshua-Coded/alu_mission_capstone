import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { UserRole } from "../../common/enums/user-role.enum";

export type UserDocument = User & Document;

@Schema({ 
  timestamps: true,
  toJSON: {
    transform: (doc: any, ret: any) => {
      if (ret.password) delete ret.password;
      if (ret.emailVerificationToken) delete ret.emailVerificationToken;
      if (ret.passwordResetToken) delete ret.passwordResetToken;
      if (ret.__v !== undefined) delete ret.__v;
      return ret;
    }
  }
})
export class User {
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

  @Prop({ required: true, enum: Object.values(UserRole) })
  role: UserRole;

  // FIXED: Make walletAddress properly optional with sparse index
  @Prop({ 
    unique: true, 
    lowercase: true, 
    sparse: true,  // This allows multiple null/undefined values
    required: false 
  })
  walletAddress?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  emailVerificationTokenExpires?: Date;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetTokenExpires?: Date;

  @Prop()
  profileImage?: string;

  @Prop()
  lastLogin?: Date;

  @Prop()
  mobileMoneyAccount?: string;

  @Prop()
  location?: string;

  @Prop()
  bio?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Create indexes - REMOVE the duplicate walletAddress index
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ emailVerificationToken: 1 });
// Don't add walletAddress index here since it's already defined in @Prop