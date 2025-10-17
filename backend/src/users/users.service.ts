import * as bcrypt from "bcryptjs";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { GovernmentDepartment, ProjectCategory, UserRole } from "../common/enums/user-role.enum";
import { User, UserDocument } from "./schemas/user.schema";

import { 
  ConflictException, 
  Injectable, 
  NotFoundException,
  BadRequestException
} from "@nestjs/common";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: Partial<User>): Promise<UserDocument> {
    try {
      const userData = { ...createUserDto };
      
      // Hash password
      if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 12);
      }

      // Set role defaults
      if (userData.role === UserRole.GOVERNMENT_OFFICIAL) {
        userData.department = userData.department || GovernmentDepartment.GENERAL;
        userData.roles = userData.roles || [UserRole.GOVERNMENT_OFFICIAL];
        userData.currentWorkload = userData.currentWorkload ?? 0;
        userData.maxWorkload = userData.maxWorkload ?? 10;
        userData.projectsReviewed = userData.projectsReviewed ?? 0;
        userData.projectsApproved = userData.projectsApproved ?? 0;
        userData.averageProcessingTime = userData.averageProcessingTime ?? 0;
      } else {
        userData.roles = userData.roles || [userData.role as UserRole];
      }

      const user = new this.userModel(userData);
      const savedUser = await user.save();
      
      console.log(`✅ Created user: ${savedUser.email}`);
      return savedUser;
      
    } catch (error: any) {
      console.error('Create error:', error);
      
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        throw new ConflictException(`${field} already exists`);
      }
      
      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByWalletAddress(walletAddress: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ 
      walletAddress: walletAddress.toLowerCase().trim() 
    }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    try {
      if (!Types.ObjectId.isValid(id)) return null;
      return await this.userModel.findById(id).select('-password').exec();
    } catch {
      return null;
    }
  }

  async findByEmailVerificationToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: new Date() }
    }).exec();
  }

  async updateLastLogin(id: string): Promise<UserDocument | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid user ID');
      }
      
      return await this.userModel.findByIdAndUpdate(
        id,
        { lastLogin: new Date() },
        { new: true }
      ).select('-password').exec();
    } catch (error: any) {
      console.error('Update last login error:', error);
      throw new BadRequestException('Failed to update login time');
    }
  }

  async updateEmailVerificationToken(
    id: string, 
    token: string, 
    expires: Date
  ): Promise<UserDocument | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid user ID');
      }
      
      return await this.userModel.findByIdAndUpdate(
        id,
        { 
          emailVerificationToken: token,
          emailVerificationTokenExpires: expires,
          emailVerified: false
        },
        { new: true }
      ).exec();
    } catch (error) {
      throw new BadRequestException('Failed to update verification token');
    }
  }

  async verifyEmail(token: string): Promise<UserDocument | null> {
    const user = await this.findByEmailVerificationToken(token);
    if (!user) return null;

    user.emailVerified = true;
    user.isActive = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    
    return await user.save();
  }

  async findByPasswordResetToken(token: string): Promise<UserDocument | null> {
    const crypto = await import('crypto');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    return this.userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpires: { $gt: new Date() }
    }).exec();
  }

  async updatePassword(id: string, hashedPassword: string): Promise<UserDocument | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid user ID');
      }
      
      return await this.userModel.findByIdAndUpdate(
        id,
        { 
          password: hashedPassword,
          passwordResetToken: undefined,
          passwordResetTokenExpires: undefined
        },
        { new: true }
      ).exec();
    } catch (error) {
      throw new BadRequestException('Password update failed');
    }
  }

  async updatePasswordResetToken(
    id: string, 
    token: string, 
    expires: Date
  ): Promise<UserDocument | null> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException('Invalid user ID');
      }
      
      return await this.userModel.findByIdAndUpdate(
        id,
        { 
          passwordResetToken: token,
          passwordResetTokenExpires: expires
        },
        { new: true }
      ).exec();
    } catch (error) {
      throw new BadRequestException('Reset token update failed');
    }
  }

  // Government official methods
  async findAvailableGovernmentOfficials(
    department?: GovernmentDepartment, 
    specialization?: ProjectCategory
  ): Promise<UserDocument[]> {
    const query: any = {
      role: UserRole.GOVERNMENT_OFFICIAL,
      isActive: true,
      emailVerified: true,
      $expr: { $lt: ['$currentWorkload', '$maxWorkload'] }
    };

    if (department && department !== GovernmentDepartment.GENERAL) {
      query.department = department;
    }

    if (specialization) {
      query.specializations = specialization;
    }

    return this.userModel.find(query)
      .sort({ currentWorkload: 1 })
      .limit(10)
      .select('-password')
      .exec();
  }

  async incrementWorkload(userId: string): Promise<UserDocument | null> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }
      
      return await this.userModel.findByIdAndUpdate(
        userId,
        { $inc: { currentWorkload: 1 } },
        { new: true }
      ).exec();
    } catch (error) {
      throw new BadRequestException('Failed to increment workload');
    }
  }

  async decrementWorkload(userId: string): Promise<UserDocument | null> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }
      
      return await this.userModel.findByIdAndUpdate(
        userId,
        { $inc: { currentWorkload: -1 } },
        { new: true }
      ).exec();
    } catch (error) {
      throw new BadRequestException('Failed to decrement workload');
    }
  }

  async findByRole(role: UserRole): Promise<UserDocument[]> {
    return this.userModel
      .find({ role, isActive: true, emailVerified: true })
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateWalletAddress(userId: string, walletAddress: string): Promise<UserDocument | null> {
    try {
      if (!Types.ObjectId.isValid(userId)) {
        throw new BadRequestException('Invalid user ID');
      }
  
      // Check if wallet already exists for another user
      const existingWallet = await this.userModel.findOne({
        walletAddress: walletAddress.toLowerCase().trim(),
        _id: { $ne: userId }
      });
  
      if (existingWallet) {
        throw new ConflictException('Wallet address already registered to another user');
      }
  
      return await this.userModel.findByIdAndUpdate(
        userId,
        { walletAddress: walletAddress.toLowerCase().trim() },
        { new: true }
      ).select('-password').exec();
    } catch (error) {
      console.error('Update wallet error:', error);
      throw error;
    }
  }
}