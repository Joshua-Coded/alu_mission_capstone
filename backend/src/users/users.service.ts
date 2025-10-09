import { ConflictException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserRole } from "../common/enums/user-role.enum";
import { User, UserDocument } from "./schemas/user.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: Partial<User>): Promise<UserDocument> {
    try {
      const createdUser = new this.userModel(createUserDto);
      return await createdUser.save();
    } catch (error: any) {
      if (error?.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0];
        
        if (field === 'walletAddress' && !createUserDto.walletAddress) {
          const tempWallet = `temp_${Date.now()}_${Math.random()}`;
          const userData = { ...createUserDto, walletAddress: tempWallet };
          const user = new this.userModel(userData);
          const savedUser = await user.save();
          
          savedUser.walletAddress = undefined;
          return await savedUser.save();
        }
        
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
      walletAddress: walletAddress.toLowerCase() 
    }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    try {
      return await this.userModel.findById(id).exec();
    } catch (error) {
      return null;
    }
  }

  async findByEmailVerificationToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ 
      emailVerificationToken: token,
      emailVerificationTokenExpires: { $gt: new Date() }
    }).exec();
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      id, 
      { lastLogin: new Date() },
      { new: true }
    ).exec();
  }

  async updateEmailVerificationToken(id: string, token: string, expires: Date): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      id,
      { 
        emailVerificationToken: token,
        emailVerificationTokenExpires: expires
      }
    ).exec();
  }

  async verifyEmail(token: string): Promise<UserDocument | null> {
    const user = await this.findByEmailVerificationToken(token);
    if (!user) {
      return null;
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    
    return user.save();
  }

  async findByRole(role: UserRole): Promise<UserDocument[]> {
    return this.userModel.find({ role, isActive: true }).select('-password').exec();
  }

  // ==================== PASSWORD RESET METHODS ====================

  async updatePasswordResetToken(id: string, token: string, expires: Date): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      id,
      { 
        passwordResetToken: token,
        passwordResetTokenExpires: expires
      }
    ).exec();
  }

  async findByPasswordResetToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ 
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: new Date() }
    }).exec();
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await this.userModel.findByIdAndUpdate(
      id,
      { 
        password: hashedPassword,
        passwordResetToken: undefined,
        passwordResetTokenExpires: undefined
      }
    ).exec();
  }
}