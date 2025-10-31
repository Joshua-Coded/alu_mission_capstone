import { BadRequestException, NotFoundException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { BlockchainService } from "../blockchain/blockchain.service";
import { UserRole } from "../common/enums/user-role.enum";
import { UsersService } from "../users/users.service";
import { ProjectCategory } from "./dto/create-project.dto";
import { ProjectsService } from "./projects.service";
import { Favorite } from "./schemas/favorite.schema";
import { Project } from "./schemas/project.schema";

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectModel: any;
  let favoriteModel: any;
  let blockchainService: any;
  let usersService: any;

  // Valid ObjectIds for testing
  const validProjectId = new Types.ObjectId().toString();
  const validFarmerId = new Types.ObjectId().toString();
  const validUserId = new Types.ObjectId().toString();
  const validOfficialId = new Types.ObjectId().toString();

  // ✅ Complete UserDocument mock
  const mockFarmer = {
    _id: new Types.ObjectId(validFarmerId),
    email: 'farmer@test.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'hashedpassword',
    phoneNumber: '+250788123456',
    role: UserRole.FARMER,
    roles: [UserRole.FARMER],
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    location: 'Kigali',
    profileImage: '',
    isActive: true,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: new Date(),
  };

  const mockFarmerNoWallet = {
    ...mockFarmer,
    walletAddress: undefined,
  };

  beforeEach(async () => {
    // Create comprehensive mocks
    const mockQuery = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      exec: jest.fn(),
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
    };

    // ✅ FIXED: Proper constructor mock for Mongoose model
    const mockSave = jest.fn().mockImplementation(function() {
      return Promise.resolve({
        ...this,
        _id: validProjectId,
        save: mockSave,
      });
    });

    // Create a constructor function that acts like a Mongoose model
    projectModel = jest.fn().mockImplementation((dto) => {
      return {
        ...dto,
        _id: validProjectId,
        save: mockSave,
      };
    });

    // Add static methods to the constructor
    Object.assign(projectModel, {
      find: jest.fn().mockReturnValue(mockQuery),
      findOne: jest.fn().mockReturnValue(mockQuery),
      findById: jest.fn().mockReturnValue(mockQuery),
      findByIdAndUpdate: jest.fn().mockReturnValue(mockQuery),
      findByIdAndDelete: jest.fn().mockReturnValue(mockQuery),
      countDocuments: jest.fn(),
      aggregate: jest.fn(),
      create: jest.fn(),
    });

    favoriteModel = {
      find: jest.fn().mockReturnValue(mockQuery),
      findOne: jest.fn(), // ✅ We'll set this per test
      create: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn().mockReturnValue(mockQuery),
    };

    blockchainService = {
      createProjectOnChain: jest.fn(),
      getProjectInfo: jest.fn(),
    };

    usersService = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getModelToken(Project.name),
          useValue: projectModel,
        },
        {
          provide: getModelToken(Favorite.name),
          useValue: favoriteModel,
        },
        {
          provide: BlockchainService,
          useValue: blockchainService,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a project successfully', async () => {
      const createProjectDto = {
        title: 'Test Project',
        description: 'Test Description',
        fundingGoal: 100,
        category: ProjectCategory.CROP_PRODUCTION,
        location: 'Test Location',
        timeline: '6 months',
        documents: [],
        farmerWalletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      };

      const expectedSavedProject = {
        _id: validProjectId,
        ...createProjectDto,
        farmer: validFarmerId,
        farmerWalletAddress: mockFarmer.walletAddress,
        status: 'submitted',
        projectId: expect.any(String),
        currentFunding: 0,
        contributorsCount: 0,
        milestonesCompleted: 0,
        totalMilestones: 0,
        isBlockchainFunded: false,
        blockchainProjectId: null,
        blockchainStatus: 'pending',
        blockchainTxHash: '',
      };

      usersService.findById.mockResolvedValue(mockFarmer);

      const result = await service.create(createProjectDto, validFarmerId);

      expect(usersService.findById).toHaveBeenCalledWith(validFarmerId);
      expect(projectModel).toHaveBeenCalled(); // Constructor was called
      expect(result).toBeDefined();
      expect(result._id).toBeDefined();
      expect(result.farmer).toBe(validFarmerId);
      expect(result.farmerWalletAddress).toBe(mockFarmer.walletAddress);
    });

    it('should throw error if farmer has no wallet', async () => {
      const createProjectDto = {
        title: 'Test Project',
        fundingGoal: 100,
        category: ProjectCategory.CROP_PRODUCTION,
        location: 'Test',
        timeline: '6 months',
        description: 'Test',
        documents: [],
        farmerWalletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      };

      usersService.findById.mockResolvedValue(mockFarmerNoWallet);

      await expect(service.create(createProjectDto, validFarmerId)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.create(createProjectDto, validFarmerId)).rejects.toThrow(
        'You must connect your wallet before creating a project'
      );
    });

    it('should throw error if funding goal is less than 5 MATIC', async () => {
      const createProjectDto = {
        title: 'Test Project',
        fundingGoal: 3,
        category: ProjectCategory.CROP_PRODUCTION,
        location: 'Test',
        timeline: '6 months',
        description: 'Test',
        documents: [],
        farmerWalletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      };

      usersService.findById.mockResolvedValue(mockFarmer);

      await expect(service.create(createProjectDto, validFarmerId)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.create(createProjectDto, validFarmerId)).rejects.toThrow(
        'Minimum funding goal is 5 MATIC'
      );
    });
  });

  describe('findByFarmer', () => {
    it('should return empty array for invalid farmer ID', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      projectModel.find.mockReturnValue(mockQuery);

      const result = await service.findByFarmer('invalid-id');

      expect(result).toEqual([]);
    });

    it('should return projects for valid farmer ID', async () => {
      const mockProjects = [
        {
          _id: validProjectId,
          farmer: validFarmerId,
          title: 'Test Project',
          category: ProjectCategory.CROP_PRODUCTION,
          fundingGoal: 100,
          currentFunding: 0,
        },
      ];

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProjects),
      };

      projectModel.find.mockReturnValue(mockQuery);

      const result = await service.findByFarmer(validFarmerId);

      expect(result).toEqual(mockProjects);
      expect(projectModel.find).toHaveBeenCalled();
    });
  });

  describe('verifyProject', () => {
    it('should verify project and deploy to blockchain', async () => {
      const mockProject = {
        _id: validProjectId,
        projectId: 'proj-123',
        status: 'under_review',
        title: 'Test Project',
        description: 'Test',
        fundingGoal: 100,
        category: ProjectCategory.CROP_PRODUCTION,
        location: 'Test',
        timeline: '6 months',
        farmerWalletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        documents: [],
      };

      const mockUpdatedProject = {
        ...mockProject,
        status: 'active',
        blockchainProjectId: 1,
        blockchainTxHash: '0xabc123',
        blockchainStatus: 'created',
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProject),
      };

      projectModel.findById.mockReturnValue(mockQuery);
      projectModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUpdatedProject),
      });

      blockchainService.createProjectOnChain.mockResolvedValue({
        projectId: 1,
        txHash: '0xabc123',
      });

      const result = await service.verifyProject(validProjectId, validOfficialId, 'Approved');

      expect(result.status).toBe('active');
      expect(result.blockchainProjectId).toBe(1);
      expect(blockchainService.createProjectOnChain).toHaveBeenCalled();
    });

    it('should handle blockchain deployment failure gracefully', async () => {
      const mockProject = {
        _id: validProjectId,
        projectId: 'proj-123',
        status: 'submitted',
        title: 'Test Project',
        description: 'Test',
        fundingGoal: 100,
        category: ProjectCategory.CROP_PRODUCTION,
        location: 'Test',
        timeline: '6 months',
        farmerWalletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        documents: [],
      };

      const mockUpdatedProject = {
        ...mockProject,
        status: 'active',
        blockchainStatus: 'failed',
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProject),
      };

      projectModel.findById.mockReturnValue(mockQuery);
      projectModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUpdatedProject),
      });

      blockchainService.createProjectOnChain.mockRejectedValue(
        new Error('Blockchain error')
      );

      const result = await service.verifyProject(validProjectId, validOfficialId);

      expect(result.status).toBe('active');
      expect(result.blockchainStatus).toBe('failed');
    });

    it('should throw error if project status is invalid', async () => {
      const mockProject = {
        _id: validProjectId,
        status: 'active',
        farmerWalletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProject),
      };

      projectModel.findById.mockReturnValue(mockQuery);

      await expect(
        service.verifyProject(validProjectId, validOfficialId)
      ).rejects.toThrow(BadRequestException);
      
      await expect(
        service.verifyProject(validProjectId, validOfficialId)
      ).rejects.toThrow('Cannot verify project with status: active');
    });
  });

  describe('favorites', () => {
    it('should add project to favorites', async () => {
      const mockProject = { 
        _id: validProjectId, 
        title: 'Test',
        category: ProjectCategory.CROP_PRODUCTION
      };
      
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProject),
      };

      projectModel.findById.mockReturnValue(mockQuery);
      
      // ✅ FIXED: Properly mock findOne to return null (no existing favorite)
      favoriteModel.findOne.mockResolvedValue(null);
      favoriteModel.create.mockResolvedValue({
        _id: new Types.ObjectId(),
        user: new Types.ObjectId(validUserId),
        project: new Types.ObjectId(validProjectId),
      });

      const result = await service.addToFavorites(validUserId, validProjectId);

      expect(result.message).toBe('Added to favorites');
      expect(favoriteModel.create).toHaveBeenCalled();
    });

    it('should not add duplicate favorites', async () => {
      const mockProject = { 
        _id: validProjectId, 
        title: 'Test',
        category: ProjectCategory.CROP_PRODUCTION
      };
      
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProject),
      };

      projectModel.findById.mockReturnValue(mockQuery);
      
      // ✅ Mock findOne to return existing favorite
      favoriteModel.findOne.mockResolvedValue({ 
        _id: 'existing',
        user: validUserId,
        project: validProjectId,
      });

      const result = await service.addToFavorites(validUserId, validProjectId);

      expect(result.message).toBe('Already in favorites');
      expect(favoriteModel.create).not.toHaveBeenCalled();
    });

    it('should remove project from favorites', async () => {
      favoriteModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await service.removeFromFavorites(validUserId, validProjectId);

      expect(result.message).toBe('Removed from favorites');
      expect(favoriteModel.deleteOne).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a project by ID', async () => {
      const mockProject = { 
        _id: validProjectId, 
        title: 'Test Project',
        category: ProjectCategory.CROP_PRODUCTION
      };
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProject),
      };

      projectModel.findById.mockReturnValue(mockQuery);

      const result = await service.findOne(validProjectId);

      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      projectModel.findById.mockReturnValue(mockQuery);

      await expect(service.findOne(validProjectId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('recordContribution', () => {
    it('should record contribution successfully', async () => {
      const mockProject = {
        _id: validProjectId,
        status: 'active',
        currentFunding: 50,
        contributorsCount: 5,
        fundingGoal: 100,
      };

      const mockUpdatedProject = {
        ...mockProject,
        currentFunding: 60,
        contributorsCount: 6,
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProject),
      };

      projectModel.findById.mockReturnValue(mockQuery);
      projectModel.findByIdAndUpdate.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockUpdatedProject),
      });

      const result = await service.recordContribution(
        validProjectId,
        validUserId,
        10,
        '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        '0xtxhash123'
      );

      expect(result.currentFunding).toBe(60);
      expect(result.contributorsCount).toBe(6);
    });

    it('should throw error if project is not active', async () => {
      const mockProject = {
        _id: validProjectId,
        status: 'submitted',
      };

      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProject),
      };

      projectModel.findById.mockReturnValue(mockQuery);

      await expect(
        service.recordContribution(validProjectId, validUserId, 10, '0xwallet', '0xtx')
      ).rejects.toThrow(BadRequestException);
      
      await expect(
        service.recordContribution(validProjectId, validUserId, 10, '0xwallet', '0xtx')
      ).rejects.toThrow('Can only contribute to active projects');
    });
  });
});