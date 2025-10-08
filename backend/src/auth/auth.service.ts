import * as bcrypt from "bcryptjs";
import * as crypto from "crypto";
import { BadRequestException, ConflictException, Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "../email/email.service";
import { UsersService } from "../users/users.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";

// src/auth/auth.service.ts - WITH EMAIL SERVICE

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto) {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);
  
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }
  
    // Check if wallet address is already used (only if provided)
    if (registerDto.walletAddress) {
      const existingWallet = await this.usersService.findByWalletAddress(registerDto.walletAddress);
      if (existingWallet) {
        throw new ConflictException('Wallet address already registered');
      }
    }
  
    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 12);
  
    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationTokenExpires = new Date();
    emailVerificationTokenExpires.setHours(emailVerificationTokenExpires.getHours() + 24);
  
    // Create user data object - only include fields that have values
    const userData: any = {
      email: registerDto.email.toLowerCase(),
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phoneNumber: registerDto.phoneNumber,
      role: registerDto.role,
      emailVerificationToken,
      emailVerificationTokenExpires,
      emailVerified: false,
    };
  
    // Only add optional fields if they exist
    if (registerDto.walletAddress) {
      userData.walletAddress = registerDto.walletAddress.toLowerCase();
    }
    if (registerDto.mobileMoneyAccount) {
      userData.mobileMoneyAccount = registerDto.mobileMoneyAccount;
    }
    if (registerDto.location) {
      userData.location = registerDto.location;
    }
    if (registerDto.bio) {
      userData.bio = registerDto.bio;
    }
  
    const user = await this.usersService.create(userData);
    this.logger.log(`User registered successfully: ${user.email}`);
  
    // Send verification email
    try {
      await this.emailService.sendVerificationEmail(
        user.email,
        user.firstName,
        emailVerificationToken
      );
      this.logger.log(`Verification email sent to: ${user.email}`);
    } catch (error: any) {
      this.logger.error(`Failed to send verification email: ${error.message}`);
      // Continue registration even if email fails
    }
  
    return {
      message: 'Registration successful! Please check your email to verify your account.',
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        walletAddress: user.walletAddress || null,
        emailVerified: user.emailVerified,
      },
    };
  }

  async login(loginDto: LoginDto) {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);

    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Allow login even if email not verified
    if (!user.emailVerified) {
      this.logger.warn(`User ${user.email} logged in with unverified email`);
    }

    // Update last login
    const userId = (user._id as any).toString();
    await this.usersService.updateLastLogin(userId);
    this.logger.log(`User logged in successfully: ${user.email}`);

    const payload = { 
      email: user.email, 
      sub: userId,
      role: user.role,
      walletAddress: user.walletAddress 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        walletAddress: user.walletAddress,
        emailVerified: user.emailVerified,
        lastLogin: new Date(),
      },
      message: user.emailVerified ? 'Login successful' : 'Login successful - Please verify your email address',
    };
  }

  async verifyEmail(token: string) {
    this.logger.log(`Email verification attempt with token: ${token.substring(0, 8)}...`);

    const user = await this.usersService.verifyEmail(token);
    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    this.logger.log(`Email verified successfully for user: ${user.email}`);

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        user.firstName,
        user.role
      );
      this.logger.log(`Welcome email sent to: ${user.email}`);
    } catch (error: any) {
      this.logger.error(`Failed to send welcome email: ${error.message}`);
    }

    return {
      message: 'Email verified successfully! Welcome to RootRise.',
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: true,
      },
    };
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email is already verified');
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationTokenExpires = new Date();
    emailVerificationTokenExpires.setHours(emailVerificationTokenExpires.getHours() + 24);

    const userId = (user._id as any).toString();
    await this.usersService.updateEmailVerificationToken(
      userId,
      emailVerificationToken,
      emailVerificationTokenExpires
    );

    // Send verification email
    await this.emailService.sendVerificationEmail(
      user.email,
      user.firstName,
      emailVerificationToken
    );

    this.logger.log(`Verification email resent to: ${user.email}`);

    return {
      message: 'Verification email sent successfully! Please check your inbox.',
    };
  }
}
