import * as bcrypt from "bcryptjs";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

import { 
  BadRequestException, 
  Body, 
  Controller, 
  Get, 
  HttpException,
  HttpStatus,
  Param, 
  Patch,
  Post, 
  Req,
  Request, 
  UseGuards 
} from "@nestjs/common";

interface RequestWithUser extends Request {
  user: {
    userId: string;
    role: string;
    email: string;
  };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Body() body: { token: string }) {
    return this.authService.verifyEmail(body.token);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend verification email' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 400, description: 'Email already verified or user not found' })
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerificationEmail(body.email);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent if user exists' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successful' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword
    );
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Returns user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Request() req) {
    console.log('🔍 JWT Payload in getProfile:', req.user);
    
    const userPayload = req.user;
    
    if (!userPayload) {
      throw new Error('User not found in request');
    }
  
    const userId = userPayload.userId;
    
    console.log('🔄 Extracted user ID:', userId);
    
    if (!userId) {
      console.error('❌ No user ID found in JWT payload:', userPayload);
      throw new Error('User ID not found in JWT payload');
    }
  
    console.log('🔄 Fetching full user profile from database for ID:', userId);
    const fullUser = await this.authService.getUserById(userId);
    
    if (!fullUser) {
      console.error('❌ User not found in database for ID:', userId);
      throw new Error('User not found in database');
    }
  
    console.log('✅ User found in database:', fullUser.email);
  
    return {
      id: fullUser._id?.toString(),
      _id: fullUser._id?.toString(),
      email: fullUser.email,
      firstName: fullUser.firstName,
      lastName: fullUser.lastName,
      role: fullUser.role,
      roles: [fullUser.role],
      walletAddress: fullUser.walletAddress,
      phoneNumber: fullUser.phoneNumber,
      lastLogin: fullUser.lastLogin,
      emailVerified: fullUser.emailVerified,
      location: fullUser.location,
      bio: fullUser.bio,
      isGovernmentOfficial: fullUser.role === 'GOVERNMENT_OFFICIAL',
      department: (fullUser as any).department || 'General',
      createdAt: (fullUser as any).createdAt,
      updatedAt: (fullUser as any).updatedAt,
    };
  }
  
  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify JWT token validity' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Invalid token' })
  async verifyToken(@Request() req) {
    const userPayload = req.user;
    console.log('🔍 JWT Payload in verifyToken:', userPayload);
    
    return {
      valid: true,
      user: {
        id: userPayload.userId,
        _id: userPayload.userId,
        role: userPayload.role,
        roles: [userPayload.role],
        walletAddress: userPayload.walletAddress,
        emailVerified: userPayload.emailVerified,
        isGovernmentOfficial: userPayload.role === 'GOVERNMENT_OFFICIAL',
      }
    };
  }

  // ============= WALLET UPDATE ENDPOINT (PATCH) =============
  @Patch('update-wallet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user wallet address (Sepolia)' })
  @ApiResponse({ status: 200, description: 'Wallet address updated' })
  @ApiResponse({ status: 400, description: 'Invalid wallet address' })
  @ApiResponse({ status: 409, description: 'Wallet already registered' })
  async updateWalletAddress(
    @Req() req: RequestWithUser,
    @Body() body: { walletAddress: string },
  ) {
    console.log('💼 Updating wallet for user:', req.user.userId);
    console.log('💼 New wallet address:', body.walletAddress);
  
    // Validate wallet address format
    if (!body.walletAddress || !body.walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      throw new HttpException('Invalid wallet address format', HttpStatus.BAD_REQUEST);
    }
  
    // Check if wallet is already registered to another user
    const existingUser = await this.authService.findByWalletAddress(body.walletAddress);
    
    // ✅ FIXED: Proper type checking
    if (existingUser) {
      const existingUserId = existingUser._id?.toString() || (existingUser as any).id?.toString();
      
      if (existingUserId && existingUserId !== req.user.userId) {
        console.warn('⚠️ Wallet already registered to another account');
        throw new HttpException(
          'This wallet is already registered to another account',
          HttpStatus.CONFLICT,
        );
      }
    }
  
    // Update wallet address
    const updatedUser = await this.authService.updateWalletAddress(
      req.user.userId,
      body.walletAddress,
    );
  
    if (!updatedUser) {
      throw new BadRequestException('Failed to update wallet');
    }
  
    console.log('✅ Wallet updated successfully:', updatedUser.walletAddress);
  
    return {
      success: true,
      message: 'Wallet address updated successfully',
      walletAddress: updatedUser.walletAddress,
      user: {
        id: updatedUser._id?.toString(),
        _id: updatedUser._id?.toString(),
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        walletAddress: updatedUser.walletAddress,
        role: updatedUser.role,
      },
    };
  }

  // ============= DEBUG ENDPOINTS =============
  @Post('debug-reset-password')
  @ApiOperation({ summary: '[DEBUG] Reset password for testing' })
  async debugResetPassword(@Body() body: { email: string; newPassword: string }) {
    try {
      console.log('🛠️ DEBUG: Resetting password for:', body.email);
      
      // Get the user
      const user = await (this.authService as any).usersService.findByEmail(body.email);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Hash the new password
      console.log('🛠️ DEBUG: Hashing password:', body.newPassword);
      const hashedPassword = await bcrypt.hash(body.newPassword, 12);
      console.log('🛠️ DEBUG: Hashed password:', hashedPassword);
      
      // Update the password directly
      user.password = hashedPassword;
      await user.save();

      console.log('✅ DEBUG: Password reset successful for:', body.email);
      return { 
        success: true, 
        message: 'Password reset successfully',
        email: body.email
      };
      
    } catch (error) {
      console.error('❌ DEBUG RESET ERROR:', error);
      throw new BadRequestException(`Reset failed: ${error.message}`);
    }
  }

  @Get('debug-user/:email')
  @ApiOperation({ summary: '[DEBUG] Check user status' })
  async debugUser(@Param('email') email: string) {
    try {
      const user = await (this.authService as any).usersService.findByEmail(email);
      if (!user) {
        return { error: 'User not found' };
      }
      
      // Test password with common variations
      const testPasswords = [
        "Alana2001@",
        "Alana2001",
        "alana2001@",
        "Alana2001!",
        "Alana2001 ",
        " Alana2001@"
      ];
      
      const passwordTests = {};
      for (const pwd of testPasswords) {
        passwordTests[pwd] = await bcrypt.compare(pwd, user.password);
      }
      
      return {
        email: user.email,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        role: user.role,
        walletAddress: user.walletAddress || 'Not connected',
        hasPassword: !!user.password,
        passwordLength: user.password?.length,
        passwordTests,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    } catch (error) {
      return { error: error.message };
    }
  }
}