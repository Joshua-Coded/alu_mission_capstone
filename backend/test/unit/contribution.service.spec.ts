import * as bcrypt from "bcryptjs";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { BlockchainService } from "../../src/blockchain/blockchain.service";
import { ContributionService } from "../../src/contribution/contribution.service";
import { Contribution } from "../../src/contribution/schemas/contribution.schema";
import { Withdrawal } from "../../src/contribution/schemas/withdrawal.schema";
import { ProjectsService } from "../../src/projects/projects.service";
import { Favorite } from "../../src/projects/schemas/favorite.schema";
import { Project } from "../../src/projects/schemas/project.schema";
import { User } from "../../src/users/schemas/user.schema";
import { UsersService } from "../../src/users/users.service";

// test/unit/contribution.service.spec.ts

describe('ContributionService', () => {
  let service: ContributionService;
  let contributionModel: any;
  let withdrawalModel: any;

  const mockContribution = {
    _id: 'contribution123',
    projectId: 'project123',
    userId: 'user123',
    amount: 0.5,
    currency: 'ETH',
    status: 'confirmed',
    save: jest.fn().mockResolvedValue(this),
  };

  const mockContributionModel = {
    new: jest.fn().mockResolvedValue(mockContribution),
    constructor: jest.fn().mockResolvedValue(mockContribution),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
    exec: jest.fn(),
  };

  const mockWithdrawalModel = {
    new: jest.fn(),
    constructor: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContributionService,
        {
          provide: getModelToken(Contribution.name),
          useValue: mockContributionModel,
        },
        {
          provide: getModelToken(Withdrawal.name),
          useValue: mockWithdrawalModel,
        },
      ],
    }).compile();

    service = module.get<ContributionService>(ContributionService);
    contributionModel = module.get(getModelToken(Contribution.name));
    withdrawalModel = module.get(getModelToken(Withdrawal.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a contribution', async () => {
      const createDto = {
        projectId: 'project123',
        amount: 0.5,
        currency: 'ETH' as const,
      };

      contributionModel.create.mockResolvedValue(mockContribution);

      const result = await service.create(createDto, 'user123');
      expect(result).toEqual(mockContribution);
    });
  });

  describe('getUserContributions', () => {
    it('should return user contributions', async () => {
      const mockContributions = [mockContribution];
      
      mockContributionModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockContributions),
              }),
            }),
          }),
        }),
      });

      mockContributionModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.getMyContributions('user123', 1);
      expect(result.contributions).toEqual(mockContributions);
    });
  });
});

// test/unit/projects.service.spec.ts

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectModel: any;
  let favoriteModel: any;
  let blockchainService: BlockchainService;
  let usersService: UsersService;

  const mockProject = {
    _id: 'project123',
    title: 'Test Project',
    description: 'Test Description',
    farmer: 'farmer123',
    status: 'draft',
    fundingGoal: 1000,
    save: jest.fn().mockResolvedValue(this),
  };

  const mockProjectModel = {
    new: jest.fn().mockResolvedValue(mockProject),
    constructor: jest.fn().mockResolvedValue(mockProject),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
    exec: jest.fn(),
  };

  const mockFavoriteModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndDelete: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
  };

  const mockBlockchainService = {
    createProjectOnChain: jest.fn(),
    getProjectFromChain: jest.fn(),
    checkProjectCompletion: jest.fn(),
    completeProjectOnChain: jest.fn(),
    isConnected: jest.fn().mockReturnValue(true),
  };

  const mockUsersService = {
    findById: jest.fn(),
    findAvailableGovernmentOfficials: jest.fn(),
    incrementWorkload: jest.fn(),
    decrementWorkload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken(Project.name),
          useValue: mockProjectModel,
        },
        {
          provide: getModelToken(Favorite.name),
          useValue: mockFavoriteModel,
        },
        {
          provide: BlockchainService,
          useValue: mockBlockchainService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectModel = module.get(getModelToken(Project.name));
    favoriteModel = module.get(getModelToken(Favorite.name));
    blockchainService = module.get<BlockchainService>(BlockchainService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a project', async () => {
      mockProjectModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockProject),
            }),
          }),
        }),
      });

      const result = await service.findOne('project123');
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockProjectModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(null),
            }),
          }),
        }),
      });

      await expect(service.findOne('invalid')).rejects.toThrow();
    });
  });

  describe('verifyProject', () => {
    it('should verify a project', async () => {
      const verifiedProject = { ...mockProject, status: 'active' };
      
      mockProjectModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(mockProject),
            }),
          }),
        }),
      });

      mockProjectModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(verifiedProject),
          }),
        }),
      });

      const result = await service.verifyProject('project123', 'official123');
      expect(result.status).toBe('active');
    });
  });

  describe('addToFavorites', () => {
    it('should add project to favorites', async () => {
      mockProjectModel.findById.mockResolvedValue(mockProject);
      mockFavoriteModel.findOne.mockResolvedValue(null);
      mockFavoriteModel.create.mockResolvedValue({ user: 'user123', project: 'project123' });

      const result = await service.addToFavorites('user123', 'project123');
      expect(result.message).toContain('favorites');
    });

    it('should throw error if already favorited', async () => {
      mockProjectModel.findById.mockResolvedValue(mockProject);
      mockFavoriteModel.findOne.mockResolvedValue({ user: 'user123', project: 'project123' });

      await expect(service.addToFavorites('user123', 'project123')).rejects.toThrow();
    });
  });
});

// test/unit/users.service.spec.ts

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let userModel: any;

  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    password: 'hashedPassword',
    firstName: 'John',
    lastName: 'Doe',
    role: 'farmer',
    save: jest.fn().mockResolvedValue(this),
  };

  const mockUserModel = {
    new: jest.fn().mockResolvedValue(mockUser),
    constructor: jest.fn().mockResolvedValue(mockUser),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    find: jest.fn(),
    exec: jest.fn(),
    select: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user with hashed password', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      
      mockUserModel.prototype.save = jest.fn().mockResolvedValue(mockUser);

      const result = await service.create({
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'farmer',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 12);
      expect(result.email).toBe('test@example.com');
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateWalletAddress', () => {
    it('should update wallet address', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      mockUserModel.findByIdAndUpdate.mockReturnValue({
        select: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ ...mockUser, walletAddress: '0x123' }),
        }),
      });

      const result = await service.updateWalletAddress('user123', '0x123');
      expect(result.walletAddress).toBe('0x123');
    });

    it('should throw error if wallet already exists', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: 'differentUser' }),
      });

      await expect(service.updateWalletAddress('user123', '0x123')).rejects.toThrow();
    });
  });
});