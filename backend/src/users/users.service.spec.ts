import * as bcrypt from "bcryptjs";
import { BadRequestException, ConflictException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { GovernmentDepartment } from "../../src/common/enums/user-role.enum";
import { UserRole } from "../../src/common/enums/user-role.enum";
import { User } from "../../src/users/schemas/user.schema";
import { UsersService } from "../../src/users/users.service";

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  const mockUserId = new Types.ObjectId();
  const mockOtherUserId = new Types.ObjectId();

  const mockUser = {
    _id: mockUserId,
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+250123456789',
    role: UserRole.FARMER,
    roles: [UserRole.FARMER],
    walletAddress: '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
    emailVerified: true,
    isActive: true,
    lastLogin: new Date(),
  };

  beforeEach(async () => {
    const mockSave = jest.fn().mockImplementation(function (this: any) {
      return Promise.resolve({
        ...this,
        _id: mockUserId,
        save: mockSave,
      });
    });
  
    const MockUserModel = jest.fn().mockImplementation((data) => ({
      ...data,
      _id: mockUserId,
      save: mockSave,
    }));
  
    // DO NOT use mockReturnThis() for query methods
    const queryMethods = {
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      create: jest.fn(),
      select: jest.fn(),
      sort: jest.fn(),
      limit: jest.fn(),
      exec: jest.fn(),
    };
  
    Object.assign(MockUserModel, queryMethods);
  
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User.name), useValue: MockUserModel },
      ],
    }).compile();
  
    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
  
    // CORRECT: Set default return values for query chains
    const defaultQuery = {
      select: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(null),
    };
  
    userModel.find.mockReturnValue(defaultQuery);
    userModel.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    userModel.findById.mockReturnValue({ ...defaultQuery, exec: jest.fn().mockResolvedValue(null) });
    userModel.findByIdAndUpdate.mockReturnValue({ ...defaultQuery, exec: jest.fn().mockResolvedValue(null) });
  });

  afterEach(() => {
    jest.clearAllMocks();  // <-- Use clearAllMocks instead
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'TestPassword123!',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+250987654321',
        role: UserRole.CONTRIBUTOR,
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      const result = await service.create(createUserDto);

      expect(userModel).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedPassword',
        roles: [UserRole.CONTRIBUTOR],
      });
      expect(result).toBeDefined();
      expect(result._id).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
    });

    it('should throw ConflictException if email already exists', async () => {
      const createUserDto = {
        email: 'existing@example.com',
        password: 'TestPassword123!',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+250987654321',
        role: UserRole.CONTRIBUTOR,
      };

      const error = { code: 11000, keyPattern: { email: 1 } };
      const mockSave = jest.fn().mockRejectedValue(error);
      userModel.mockImplementationOnce(() => ({ save: mockSave }));

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should hash password before saving', async () => {
      const createUserDto = {
        email: 'newuser@example.com',
        password: 'PlainPassword123!',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+250987654321',
        role: UserRole.CONTRIBUTOR,
      };

      const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      await service.create(createUserDto);
      expect(hashSpy).toHaveBeenCalledWith('PlainPassword123!', 12);
    });

    it('should set default values for government officials', async () => {
      const govUserDto = {
        email: 'official@gov.rw',
        password: 'GovPassword123!',
        firstName: 'Gov',
        lastName: 'Official',
        phoneNumber: '+250111222333',
        role: UserRole.GOVERNMENT_OFFICIAL,
        department: GovernmentDepartment.CROPS,
      };

      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);
      const result = await service.create(govUserDto);

      expect(result).toBeDefined();
      expect(userModel).toHaveBeenCalledWith(
        expect.objectContaining({
          role: UserRole.GOVERNMENT_OFFICIAL,
          department: GovernmentDepartment.CROPS,
          currentWorkload: 0,
          maxWorkload: 10,
          projectsReviewed: 0,
        })
      );
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      userModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockUser) });
      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should return null if user not found', async () => {
      userModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });
      const result = await service.findByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('findByWalletAddress', () => {
    it('should find user by wallet address', async () => {
      userModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockUser) });
      const result = await service.findByWalletAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
      expect(result).toEqual(mockUser);
    });

    it('should normalize wallet address case', async () => {
      userModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(mockUser) });
      await service.findByWalletAddress('0X742D35CC6634C0532925A3B844BC9E7595F0BEB');
      expect(userModel.findOne).toHaveBeenCalledWith({
        walletAddress: '0x742d35cc6634c0532925a3b844bc9e7595f0beb',
      });
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      userModel.findById.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUser),
      });
      const result = await service.findById(mockUserId.toString());
      expect(result).toEqual(mockUser);
    });

    it('should return null for invalid ObjectId', async () => {
      const result = await service.findById('invalid-id');
      expect(result).toBeNull();
    });

    it('should exclude password from result', async () => {
      const selectMock = jest.fn().mockReturnThis();
      userModel.findById.mockReturnValueOnce({ select: selectMock, exec: jest.fn() });
      await service.findById(mockUserId.toString());
      expect(selectMock).toHaveBeenCalledWith('-password');
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      userModel.findByIdAndUpdate.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({ ...mockUser, lastLogin: new Date() }),
      });
      const result = await service.updateLastLogin(mockUserId.toString());
      expect(result).toBeDefined();
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId.toString(),
        { lastLogin: expect.any(Date) },
        { new: true }
      );
    });
  });

  describe('updateWalletAddress', () => {
    const userIdStr = mockUserId.toString();
  
    it('should update wallet address successfully', async () => {
      const newWallet = '0x1234567890123456789012345678901234567890';
  
      // Don't replace the mock, modify it
      userModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null), // No conflict
      });
      userModel.findByIdAndUpdate.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          ...mockUser,
          walletAddress: newWallet.toLowerCase(),
        }),
      });
  
      const result = await service.updateWalletAddress(userIdStr, newWallet);
  
      expect(result.walletAddress).toBe(newWallet.toLowerCase());
    });
  
    it('should throw ConflictException if wallet already exists for another user', async () => {
      const existingWallet = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
  
      // Don't replace the mock, modify it
      userModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({
          _id: mockOtherUserId,
          walletAddress: existingWallet.toLowerCase(),
        }),
      });
  
      await expect(service.updateWalletAddress(userIdStr, existingWallet))
        .rejects.toThrow(ConflictException);
    });
  
    it('should not throw if wallet exists but is same user', async () => {
      const existingWallet = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
  
      // Don't replace the mock, modify it
      userModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null), // Query excludes current user
      });
      userModel.findByIdAndUpdate.mockReturnValueOnce({
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue({
          ...mockUser,
          walletAddress: existingWallet.toLowerCase(),
        }),
      });
  
      const result = await service.updateWalletAddress(userIdStr, existingWallet);
  
      expect(result).toBeDefined();
      expect(result.walletAddress).toBe(existingWallet.toLowerCase());
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const token = 'valid-verification-token';
      const saveMock = jest.fn().mockResolvedValue({
        ...mockUser,
        emailVerified: true,
        emailVerificationToken: undefined,
      });

      userModel.findOne.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({
          ...mockUser,
          emailVerified: false,
          emailVerificationToken: token,
          save: saveMock,
        }),
      });

      const result = await service.verifyEmail(token);
      expect(result.emailVerified).toBe(true);
      expect(saveMock).toHaveBeenCalled();
    });

    it('should return null for invalid token', async () => {
      userModel.findOne.mockReturnValueOnce({ exec: jest.fn().mockResolvedValue(null) });
      const result = await service.verifyEmail('invalid-token');
      expect(result).toBeNull();
    });
  });

  describe('findAvailableGovernmentOfficials', () => {
    it('should find available government officials', async () => {
      const mockOfficials = [
        { ...mockUser, role: UserRole.GOVERNMENT_OFFICIAL, currentWorkload: 3 },
        { ...mockUser, role: UserRole.GOVERNMENT_OFFICIAL, currentWorkload: 5 },
      ];

      userModel.find.mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOfficials),
      });

      const result = await service.findAvailableGovernmentOfficials();
      expect(result).toHaveLength(2);
      expect(userModel.find).toHaveBeenCalledWith({
        role: UserRole.GOVERNMENT_OFFICIAL,
        isActive: true,
        emailVerified: true,
        $expr: { $lt: ['$currentWorkload', '$maxWorkload'] },
      });
    });

    it('should filter by department', async () => {
      userModel.find.mockReturnValueOnce({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      });

      await service.findAvailableGovernmentOfficials(GovernmentDepartment.CROPS);
      expect(userModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ department: GovernmentDepartment.CROPS })
      );
    });
  });

  describe('incrementWorkload', () => {
    it('should increment user workload', async () => {
      userModel.findByIdAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({ ...mockUser, currentWorkload: 1 }),
      });

      await service.incrementWorkload(mockUserId.toString());
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId.toString(),
        { $inc: { currentWorkload: 1 } },
        { new: true }
      );
    });
  });

  describe('decrementWorkload', () => {
    it('should decrement user workload', async () => {
      userModel.findByIdAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({ ...mockUser, currentWorkload: 0 }),
      });

      await service.decrementWorkload(mockUserId.toString());
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUserId.toString(),
        { $inc: { currentWorkload: -1 } },
        { new: true }
      );
    });
  });
});