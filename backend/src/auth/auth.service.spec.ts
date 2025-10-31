import * as bcrypt from "bcryptjs";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { AuthService } from "../../src/auth/auth.service";
import { UserRole } from "../../src/common/enums/user-role.enum";
import { EmailService } from "../../src/email/email.service";
import { UsersService } from "../../src/users/users.service";

import { 
  ConflictException, 
  UnauthorizedException, 
  BadRequestException,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let emailService: EmailService;

  // Valid ObjectIds
  const validUserId = new Types.ObjectId().toString();

  const mockUser = {
    _id: new Types.ObjectId(validUserId),
    email: 'test@example.com',
    password: '$2a$12$hashedpassword',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.FARMER,
    roles: [UserRole.FARMER],
    emailVerified: true,
    isActive: true,
    phoneNumber: '+250123456789',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    location: 'Kigali',
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn().mockResolvedValue(this),
  };

  const mockRegisterDto = {
    email: 'newuser@example.com',
    password: 'StrongPass123!',
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '+250987654321',
    role: UserRole.CONTRIBUTOR,
    termsAccepted: true,
    location: 'Kigali',
  };

  const mockLoginDto = {
    email: 'test@example.com',
    password: 'TestPassword123!',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findByWalletAddress: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateLastLogin: jest.fn(),
            updateEmailVerificationToken: jest.fn(),
            verifyEmail: jest.fn(),
            updatePasswordResetToken: jest.fn(),
            findByPasswordResetToken: jest.fn(),
            updatePassword: jest.fn(),
            updateWalletAddress: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock.jwt.token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-config-value'),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
            sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
            sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    emailService = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      const result = await service.register(mockRegisterDto as any);

      expect(result).toHaveProperty('message', 'Registration successful! Please verify your email.');
      expect(result).toHaveProperty('user');
      expect(usersService.create).toHaveBeenCalled();
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);

      await expect(service.register(mockRegisterDto as any))
        .rejects.toThrow(ConflictException);
      
      await expect(service.register(mockRegisterDto as any))
        .rejects.toThrow('User with this email already exists');
    });

    it('should throw ConflictException if wallet address already exists', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'findByWalletAddress').mockResolvedValue(mockUser as any);

      const dtoWithWallet = { 
        ...mockRegisterDto, 
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' 
      };

      await expect(service.register(dtoWithWallet as any))
        .rejects.toThrow(ConflictException);
      
      await expect(service.register(dtoWithWallet as any))
        .rejects.toThrow('Wallet address already registered');
    });

    it('should throw BadRequestException for invalid role', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const invalidDto = { ...mockRegisterDto, role: 'INVALID_ROLE' };

      await expect(service.register(invalidDto as any))
        .rejects.toThrow(BadRequestException);
    });

    it('should validate government official fields', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const govDto = {
        ...mockRegisterDto,
        role: UserRole.GOVERNMENT_OFFICIAL,
        department: 'INVALID_DEPARTMENT',
        specializations: [],
        location: 'Kigali',
      };

      await expect(service.register(govDto as any))
        .rejects.toThrow(BadRequestException);
    });

    it('should hash password during registration', async () => {
      const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser as any);

      await service.register(mockRegisterDto as any);

      expect(hashSpy).toHaveBeenCalledWith(mockRegisterDto.password, 12);
    });

    it('should handle email service failure gracefully', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      jest.spyOn(emailService, 'sendVerificationEmail').mockRejectedValue(
        new Error('Email service down')
      );

      // Should still succeed even if email fails
      const result = await service.register(mockRegisterDto as any);

      expect(result).toHaveProperty('message', 'Registration successful! Please verify your email.');
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(usersService, 'updateLastLogin').mockResolvedValue(mockUser as any);

      const result = await service.login(mockLoginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('message', 'Login successful');
      expect(jwtService.sign).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(service.login(mockLoginDto))
        .rejects.toThrow(UnauthorizedException);
      
      await expect(service.login(mockLoginDto))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException for incorrect password', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(mockLoginDto))
        .rejects.toThrow(UnauthorizedException);
      
      await expect(service.login(mockLoginDto))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if email not verified', async () => {
      const unverifiedUser = { ...mockUser, emailVerified: false };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(unverifiedUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await expect(service.login(mockLoginDto))
        .rejects.toThrow(UnauthorizedException);
      
      await expect(service.login(mockLoginDto))
        .rejects.toThrow('Please verify your email before logging in');
    });

    it('should throw UnauthorizedException if account is inactive', async () => {
      const inactiveUser = { ...mockUser, isActive: false };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(inactiveUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      await expect(service.login(mockLoginDto))
        .rejects.toThrow(UnauthorizedException);
      
      await expect(service.login(mockLoginDto))
        .rejects.toThrow('Account is deactivated');
    });

    it('should include all required JWT payload fields', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(usersService, 'updateLastLogin').mockResolvedValue(mockUser as any);

      await service.login(mockLoginDto);

      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockUser.email,
          userId: expect.any(String),
          role: mockUser.role,
          roles: expect.any(Array),
        })
      );
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', async () => {
      const verifiedUser = { ...mockUser, emailVerified: true };
      jest.spyOn(usersService, 'verifyEmail').mockResolvedValue(verifiedUser as any);

      const result = await service.verifyEmail('valid-token');

      expect(result).toHaveProperty('message', 'Email verified successfully!');
      expect(result).toHaveProperty('user');
      expect(emailService.sendWelcomeEmail).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid token', async () => {
      jest.spyOn(usersService, 'verifyEmail').mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token'))
        .rejects.toThrow(BadRequestException);
      
      await expect(service.verifyEmail('invalid-token'))
        .rejects.toThrow('Invalid or expired token');
    });

    it('should handle welcome email failure gracefully', async () => {
      const verifiedUser = { ...mockUser, emailVerified: true };
      jest.spyOn(usersService, 'verifyEmail').mockResolvedValue(verifiedUser as any);
      jest.spyOn(emailService, 'sendWelcomeEmail').mockRejectedValue(
        new Error('Email service down')
      );

      // Should still succeed even if welcome email fails
      const result = await service.verifyEmail('valid-token');

      expect(result).toHaveProperty('message', 'Email verified successfully!');
    });
  });

  describe('resendVerificationEmail', () => {
    it('should resend verification email successfully', async () => {
      const unverifiedUser = { ...mockUser, emailVerified: false };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(unverifiedUser as any);
      jest.spyOn(usersService, 'updateEmailVerificationToken').mockResolvedValue(mockUser as any);

      const result = await service.resendVerificationEmail('test@example.com');

      expect(result).toHaveProperty('message', 'Verification email sent!');
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should throw BadRequestException if email already verified', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);

      await expect(service.resendVerificationEmail('test@example.com'))
        .rejects.toThrow(BadRequestException);
      
      await expect(service.resendVerificationEmail('test@example.com'))
        .rejects.toThrow('Invalid request');
    });

    it('should throw BadRequestException if user not found', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(service.resendVerificationEmail('nonexistent@example.com'))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(usersService, 'updatePasswordResetToken').mockResolvedValue(mockUser as any);

      const result = await service.forgotPassword('test@example.com');

      expect(result).toHaveProperty('message', 'Password reset email sent if user exists');
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should return success message even if user not found (security)', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result).toHaveProperty('message', 'Password reset email sent if user exists');
      expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      jest.spyOn(usersService, 'findByPasswordResetToken').mockResolvedValue(mockUser as any);
      jest.spyOn(usersService, 'updatePassword').mockResolvedValue(mockUser as any);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('newHashedPassword' as never);

      const result = await service.resetPassword('valid-token', 'NewPassword123!');

      expect(result).toHaveProperty('message', 'Password reset successful');
      expect(usersService.updatePassword).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPassword123!', 12);
    });

    it('should throw BadRequestException for invalid token', async () => {
      jest.spyOn(usersService, 'findByPasswordResetToken').mockResolvedValue(null);

      await expect(service.resetPassword('invalid-token', 'NewPassword123!'))
        .rejects.toThrow(BadRequestException);
      
      await expect(service.resetPassword('invalid-token', 'NewPassword123!'))
        .rejects.toThrow('Invalid or expired token');
    });
  });

  describe('updateWalletAddress', () => {
    it('should update wallet address successfully', async () => {
      const updatedUser = { 
        ...mockUser, 
        walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' 
      };
      jest.spyOn(usersService, 'updateWalletAddress').mockResolvedValue(updatedUser as any);

      const result = await service.updateWalletAddress(
        validUserId,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
      );

      expect(result.walletAddress).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
      expect(usersService.updateWalletAddress).toHaveBeenCalledWith(
        validUserId,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
      );
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(usersService, 'updateWalletAddress').mockResolvedValue(null);

      await expect(
        service.updateWalletAddress(validUserId, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByWalletAddress', () => {
    it('should find user by wallet address', async () => {
      jest.spyOn(usersService, 'findByWalletAddress').mockResolvedValue(mockUser as any);

      const result = await service.findByWalletAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');

      expect(result).toEqual(mockUser);
      expect(usersService.findByWalletAddress).toHaveBeenCalledWith('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
    });

    it('should return null if wallet not found', async () => {
      jest.spyOn(usersService, 'findByWalletAddress').mockResolvedValue(null);

      const result = await service.findByWalletAddress('0x0000000000000000000000000000000000000000');

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should get user by ID', async () => {
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser as any);

      const result = await service.getUserById(validUserId);

      expect(result).toEqual(mockUser);
      expect(usersService.findById).toHaveBeenCalledWith(validUserId);
    });

    it('should use cache for repeated requests', async () => {
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser as any);

      await service.getUserById(validUserId);
      await service.getUserById(validUserId);

      // Should only call DB once (second call uses cache)
      expect(usersService.findById).toHaveBeenCalledTimes(1);
    });

    it('should return null if user not found', async () => {
      jest.spyOn(usersService, 'findById').mockResolvedValue(null);

      const result = await service.getUserById('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('clearUserCache', () => {
    it('should clear user from cache', async () => {
      jest.spyOn(usersService, 'findById').mockResolvedValue(mockUser as any);

      // First call - caches user
      await service.getUserById(validUserId);
      
      // Clear cache
      service.clearUserCache(validUserId);
      
      // Second call - should hit DB again
      await service.getUserById(validUserId);

      expect(usersService.findById).toHaveBeenCalledTimes(2);
    });
  });
});