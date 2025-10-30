import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Types } from "mongoose";
import { GovernmentDepartment, ProjectCategory, UserRole } from "../common/enums/user-role.enum";
import { EmailService } from "../email/email.service";
import { User } from "../users/schemas/user.schema";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

import { 
  BadRequestException, 
  ConflictException, 
  Injectable, 
  Logger, 
  UnauthorizedException,
  InternalServerErrorException, 
  NotFoundException
} from "@nestjs/common";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private userCache = new Map<string, any>();

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  private safeUserId(user: any): string {
    if (!user || !user._id) {
      throw new Error('Invalid user object - missing _id');
    }
    
    const userId = user._id;
    if (typeof userId === 'string' && Types.ObjectId.isValid(userId)) {
      return userId;
    }
    
    if (userId instanceof Types.ObjectId) {
      return userId.toString();
    }
    
    throw new Error('Invalid user ID format');
  }

  async register(registerDto: RegisterDto) {
    this.logger.log(`Registration: ${registerDto.email} (${registerDto.role})`);
    
    try {
      // Validate role
      if (!Object.values(UserRole).includes(registerDto.role)) {
        throw new BadRequestException(`Invalid role: ${registerDto.role}`);
      }
  
      // Check existing user
      const existingUser = await this.usersService.findByEmail(registerDto.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }
  
      // Check wallet
      if (registerDto.walletAddress) {
        const existingWallet = await this.usersService.findByWalletAddress(registerDto.walletAddress);
        if (existingWallet) {
          throw new ConflictException('Wallet address already registered');
        }
      }
  
      // Government validation
      if (registerDto.role === UserRole.GOVERNMENT_OFFICIAL) {
        this.validateGovernmentFields(registerDto);
      }
  
      // ✅ FIXED: Hash password properly
      const hashedPassword = await bcrypt.hash(registerDto.password, 12);
      
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  
      // Build user data
      const userData: any = {
        email: registerDto.email.toLowerCase().trim(),
        password: hashedPassword,
        firstName: registerDto.firstName.trim(),
        lastName: registerDto.lastName.trim(),
        phoneNumber: registerDto.phoneNumber.trim(),
        role: registerDto.role,
        roles: [registerDto.role],
        isActive: true, // ✅ FIXED: Set to true so user can login after verification
        emailVerified: false,
        emailVerificationToken,
        emailVerificationTokenExpires,
        termsAccepted: registerDto.termsAccepted,
        location: registerDto.location?.trim(),
      };
  
      // Government fields
      if (registerDto.role === UserRole.GOVERNMENT_OFFICIAL) {
        userData.department = registerDto.department || GovernmentDepartment.GENERAL;
        userData.specializations = registerDto.specializations || [];
        userData.bio = registerDto.bio?.trim();
        userData.currentWorkload = 0;
        userData.maxWorkload = 10;
        userData.projectsReviewed = 0;
        userData.projectsApproved = 0;
        userData.averageProcessingTime = 0;
      } else {
        userData.walletAddress = registerDto.walletAddress?.toLowerCase().trim();
        userData.mobileMoneyAccount = registerDto.mobileMoneyAccount?.trim();
      }
  
      this.logger.log(`Creating user: ${userData.email}`);
      const user = await this.usersService.create(userData);
      
      const userId = this.safeUserId(user);
      this.userCache.set(userId, user);
  
      // Send verification email
      try {
        await this.emailService.sendVerificationEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          emailVerificationToken
        );
        this.logger.log(`✅ Verification email sent to: ${user.email}`);
      } catch (emailError: any) {
        this.logger.error(`❌ Email sending failed: ${emailError.message}`);
      }
  
      return {
        message: 'Registration successful! Please verify your email.',
        user: this.formatUserResponse(user),
      };
  
    } catch (error: any) {
      this.logger.error(`Registration failed: ${error.message}`);
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

  private validateGovernmentFields(registerDto: RegisterDto) {
    const departments = Object.values(GovernmentDepartment);
    if (!registerDto.department || !departments.includes(registerDto.department)) {
      throw new BadRequestException(`Invalid department: ${String(registerDto.department)}`);
    }

    const categories = Object.values(ProjectCategory);
    if (!registerDto.specializations?.length || registerDto.specializations.some(
      spec => !categories.includes(spec)
    )) {
      throw new BadRequestException('Valid specializations required');
    }

    if (!registerDto.location?.trim()) {
      throw new BadRequestException('Location required for government officials');
    }
  }

  private formatUserResponse(user: any): any {
    const userId = this.safeUserId(user);
    return {
      id: userId,
      _id: userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      roles: user.roles || [user.role],
      phoneNumber: user.phoneNumber,
      walletAddress: user.walletAddress || null,
      location: user.location || null,
      bio: user.bio || null,
      department: user.department || null,
      specializations: user.specializations || [],
      emailVerified: Boolean(user.emailVerified),
      isActive: Boolean(user.isActive),
      isGovernmentOfficial: user.role === UserRole.GOVERNMENT_OFFICIAL,
      currentWorkload: Number(user.currentWorkload) || 0,
      maxWorkload: Number(user.maxWorkload) || 10,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`🔐 LOGIN START: ${loginDto.email}`);
    
    try {
      // Find user
      const user = await this.usersService.findByEmail(loginDto.email);
      
      if (!user) {
        this.logger.error(`❌ USER NOT FOUND: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      
      this.logger.log(`✅ USER FOUND: ${user.email}`);
  
      // ✅ FIXED: Check password FIRST before other validations
      const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
      
      if (!isPasswordValid) {
        this.logger.error(`❌ INVALID PASSWORD for: ${user.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      
      this.logger.log(`✅ PASSWORD VALID: ${user.email}`);
  
      // Check email verification
      if (!user.emailVerified) {
        this.logger.error(`❌ EMAIL NOT VERIFIED: ${user.email}`);
        throw new UnauthorizedException('Please verify your email before logging in');
      }
      this.logger.log(`✅ EMAIL VERIFIED: ${user.email}`);
  
      // Check account active
      if (!user.isActive) {
        this.logger.error(`❌ ACCOUNT INACTIVE: ${user.email}`);
        throw new UnauthorizedException('Account is deactivated');
      }
      this.logger.log(`✅ ACCOUNT ACTIVE: ${user.email}`);
  
      // Update last login
      const userId = this.safeUserId(user);
      await this.usersService.updateLastLogin(userId);
      this.userCache.set(userId, user);
  
      // Generate token
      const payload = {
        email: user.email,
        sub: userId,
        userId,
        role: user.role,
        roles: user.roles || [user.role],
        department: user.department,
        specializations: user.specializations,
      };
  
      const accessToken = this.jwtService.sign(payload);
      this.logger.log(`✅ LOGIN SUCCESSFUL: ${user.email}`);
  
      return {
        access_token: accessToken,
        user: this.formatUserResponse(user),
        message: 'Login successful',
      };
  
    } catch (error) {
      this.logger.error(`💥 LOGIN ERROR for ${loginDto.email}:`, error.message);
      throw error;
    }
  }

  async verifyEmail(token: string) {
    const user = await this.usersService.verifyEmail(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    try {
      const userId = this.safeUserId(user);
      this.clearUserCache(userId);
    } catch (cacheError) {
      this.logger.warn('Cache clear failed:', cacheError);
    }

    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        `${user.firstName} ${user.lastName}`,
        user.role
      );
    } catch (emailError) {
      this.logger.warn('Welcome email failed:', emailError);
    }

    return {
      message: 'Email verified successfully!',
      user: this.formatUserResponse(user),
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || user.emailVerified) {
      throw new BadRequestException('Invalid request');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    const userId = this.safeUserId(user);
    await this.usersService.updateEmailVerificationToken(userId, token, expires);

    await this.emailService.sendVerificationEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      token
    );

    return { message: 'Verification email sent!' };
  }

  async getUserById(userId: string) {
    if (this.userCache.has(userId)) {
      return this.userCache.get(userId);
    }

    const user = await this.usersService.findById(userId);
    if (user) {
      this.userCache.set(userId, user);
      setTimeout(() => this.userCache.delete(userId), 5 * 60 * 60 * 1000);
    }
    return user;
  }

  clearUserCache(userId: string) {
    this.userCache.delete(userId);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return { message: 'Password reset email sent if user exists' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 3600000);
    
    const userId = this.safeUserId(user);
    await this.usersService.updatePasswordResetToken(userId, hashedToken, expires);
    
    await this.emailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      token
    );

    return { message: 'Password reset email sent if user exists' };
  }

  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return this.usersService.findByWalletAddress(walletAddress);
  }
  
  async updateWalletAddress(userId: string, walletAddress: string): Promise<User> {
    const updatedUser = await this.usersService.updateWalletAddress(userId, walletAddress);
    
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }
  
    this.logger.log(`💼 Wallet synced for user ${userId}: ${walletAddress}`);
    return updatedUser;
  }
  

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.usersService.findByPasswordResetToken(hashedToken);
    
    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const userId = this.safeUserId(user);
    
    await this.usersService.updatePassword(userId, hashedPassword);
    this.clearUserCache(userId);

    return { message: 'Password reset successful' };
  }

}