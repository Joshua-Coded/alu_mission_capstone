import { HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { ContributionController } from "../../src/contribution/contribution.controller";
import { ContributionService } from "../../src/contribution/contribution.service";
import { ContributionStatus } from "../../src/contribution/schemas/contribution.schema";

describe('ContributionController', () => {
  let controller: ContributionController;
  let service: ContributionService;

  const mockUser = {
    userId: 'user123',
    role: 'CONTRIBUTOR',
    email: 'contributor@test.com',
  };

  const mockContribution = {
    _id: 'contribution123',
    contributor: 'user123',
    project: 'project123',
    amount: 10,
    amountMatic: 10,
    status: ContributionStatus.CONFIRMED,
    transactionHash: '0x' + 'a'.repeat(64),
    contributorWallet: '0x1234567890123456789012345678901234567890',
  };

  const mockProjectInfo = {
    project: {
      _id: 'project123',
      title: 'Test Farm',
      status: 'active',
    },
    blockchainProjectId: 0,
    farmerWalletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    contractAddress: '0xContractAddress',
    currentFunding: '25',
    fundingGoal: '100',
    isFullyFunded: false,
    isActive: true,
    fundingDeadline: '2025-12-31T00:00:00.000Z',
    canContribute: true,
    blockchainAvailable: true,
    instructions: {
      step1: 'Connect MetaMask to Polygon Mainnet',
      step2: 'User calls contribute(0) with MATIC from their wallet',
      step3: 'Smart contract holds funds in escrow until goal reached',
      step4: 'Contract auto-releases to farmer',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContributionController],
      providers: [
        {
          provide: ContributionService,
          useValue: {
            createContribution: jest.fn(),
            confirmContribution: jest.fn(),
            getMyContributions: jest.fn(),
            getContributorStats: jest.fn(),
            getPlatformStats: jest.fn(),
            getProjectForContribution: jest.fn(),
            getProjectContributions: jest.fn(),
            getContributionById: jest.fn(),
            getContributionCount: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ContributionController>(ContributionController);
    service = module.get<ContributionService>(ContributionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createContribution', () => {
    const createDto = {
      projectId: 'project123',
      amount: 10,
      contributorWallet: '0x1234567890123456789012345678901234567890',
      transactionHash: '0x' + 'a'.repeat(64),
      paymentMethod: 'blockchain',
      currency: 'MATIC',
    };

    it('should create contribution successfully', async () => {
      jest.spyOn(service, 'createContribution').mockResolvedValue(mockContribution as any);

      const result = await controller.createContribution(
        createDto as any,
        { user: mockUser } as any,
      );

      expect(result).toEqual(mockContribution);
      expect(service.createContribution).toHaveBeenCalledWith(mockUser.userId, createDto);
    });

    it('should reject non-MATIC currency', async () => {
      const invalidDto = { ...createDto, currency: 'USD' };

      await expect(
        controller.createContribution(invalidDto as any, { user: mockUser } as any),
      ).rejects.toThrow(HttpException);

      await expect(
        controller.createContribution(invalidDto as any, { user: mockUser } as any),
      ).rejects.toThrow('Only MATIC contributions are supported');
    });

    it('should reject non-blockchain payment method', async () => {
      const invalidDto = { ...createDto, paymentMethod: 'credit_card' };

      await expect(
        controller.createContribution(invalidDto as any, { user: mockUser } as any),
      ).rejects.toThrow('Only blockchain payment method is supported');
    });

    it('should require transaction hash', async () => {
      const invalidDto = { ...createDto, transactionHash: undefined };

      await expect(
        controller.createContribution(invalidDto as any, { user: mockUser } as any),
      ).rejects.toThrow('Transaction hash is required');
    });

    it('should validate transaction hash format', async () => {
      const invalidDto = { ...createDto, transactionHash: 'invalid-hash' };

      await expect(
        controller.createContribution(invalidDto as any, { user: mockUser } as any),
      ).rejects.toThrow('Invalid transaction hash format');
    });

    it('should set currency to MATIC automatically', async () => {
      const dtoWithoutCurrency = { ...createDto };
      delete (dtoWithoutCurrency as any).currency;
      
      jest.spyOn(service, 'createContribution').mockResolvedValue(mockContribution as any);

      await controller.createContribution(
        dtoWithoutCurrency as any,
        { user: mockUser } as any,
      );

      expect(dtoWithoutCurrency.currency).toBe('MATIC');
    });
  });

  describe('getProjectContributionInfo', () => {
    it('should return project contribution info', async () => {
      jest.spyOn(service, 'getProjectForContribution').mockResolvedValue(mockProjectInfo as any);

      const result = await controller.getProjectContributionInfo('project123');

      expect(result).toEqual(mockProjectInfo);
      expect(service.getProjectForContribution).toHaveBeenCalledWith('project123');
    });

    it('should handle blockchain unavailable scenario', async () => {
      const infoWithBlockchainDown = {
        ...mockProjectInfo,
        blockchainAvailable: false,
        blockchainError: 'Blockchain temporarily unavailable',
      };

      jest.spyOn(service, 'getProjectForContribution')
        .mockResolvedValue(infoWithBlockchainDown as any);

      const result = await controller.getProjectContributionInfo('project123');

      expect(result.blockchainAvailable).toBe(false);
      expect(result.blockchainError).toBeDefined();
    });
  });

  describe('getMyContributions', () => {
    it('should return user contributions', async () => {
      const mockResponse = {
        contributions: [mockContribution],
        total: 1,
        page: 1,
        pages: 1,
        totalMatic: 10,
      };

      jest.spyOn(service, 'getMyContributions').mockResolvedValue(mockResponse as any);

      const result = await controller.getMyContributions(
        { user: mockUser } as any,
        {},
      );

      expect(result).toEqual(mockResponse);
      expect(service.getMyContributions).toHaveBeenCalledWith(mockUser.userId, {});
    });

    it('should pass query parameters correctly', async () => {
      const query = { status: ContributionStatus.CONFIRMED, page: 2, limit: 20 };
      
      jest.spyOn(service, 'getMyContributions').mockResolvedValue({
        contributions: [],
        total: 0,
        page: 2,
        pages: 0,
        totalMatic: 0,
      } as any);

      await controller.getMyContributions({ user: mockUser } as any, query as any);

      expect(service.getMyContributions).toHaveBeenCalledWith(mockUser.userId, query);
    });
  });

  describe('getMyStats', () => {
    it('should return contributor statistics', async () => {
      const mockStats = {
        totalContributions: 5,
        totalAmountMatic: 50,
        projectsSupported: 3,
        confirmedContributions: 4,
        pendingContributions: 1,
      };

      jest.spyOn(service, 'getContributorStats').mockResolvedValue(mockStats);

      const result = await controller.getMyStats({ user: mockUser } as any);

      expect(result).toEqual(mockStats);
      expect(service.getContributorStats).toHaveBeenCalledWith(mockUser.userId);
    });
  });

  describe('getPlatformStats', () => {
    it('should return platform statistics', async () => {
      const mockStats = {
        totalContributions: 100,
        totalAmountMatic: 5000,
        totalContributors: 50,
        totalProjectsFunded: 20,
      };

      jest.spyOn(service, 'getPlatformStats').mockResolvedValue(mockStats);

      const result = await controller.getPlatformStats();

      expect(result).toEqual(mockStats);
      expect(service.getPlatformStats).toHaveBeenCalled();
    });
  });

  describe('verifyTransaction', () => {
    const validTxHash = '0x' + 'a'.repeat(64);

    it('should return transaction verification info', async () => {
      const result = await controller.verifyTransaction(validTxHash);

      expect(result).toHaveProperty('transactionHash', validTxHash);
      expect(result).toHaveProperty('network', 'Polygon Mainnet');
      expect(result).toHaveProperty('chainId', 137);
      expect(result).toHaveProperty('polygonscanLink');
      expect(result.polygonscanLink).toContain(validTxHash);
    });

    it('should reject invalid transaction hash format', async () => {
      const invalidHash = 'invalid-hash';

      await expect(
        controller.verifyTransaction(invalidHash),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getNetworkInfo', () => {
    it('should return Polygon network information', async () => {
      const result = await controller.getNetworkInfo();

      expect(result).toHaveProperty('network', 'Polygon Mainnet');
      expect(result).toHaveProperty('chainId', 137);
      expect(result).toHaveProperty('chainIdHex', '0x89');
      expect(result).toHaveProperty('nativeCurrency');
      expect(result.nativeCurrency.symbol).toBe('MATIC');
      expect(result).toHaveProperty('flow');
      expect(Array.isArray(result.flow)).toBe(true);
    });
  });

  describe('getProjectContributions', () => {
    it('should return project contributions list', async () => {
      const mockResponse = {
        contributions: [mockContribution],
        totalAmountMatic: 10,
        contributorCount: 1,
        farmerWalletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        blockchainProjectId: 0,
        contractAddress: '0xContractAddress',
        isFullyFunded: false,
        currentFunding: '10',
        fundingGoal: '100',
        blockchainAvailable: true,
      };

      jest.spyOn(service, 'getProjectContributions').mockResolvedValue(mockResponse as any);

      const result = await controller.getProjectContributions('project123');

      expect(result).toEqual(mockResponse);
      expect(service.getProjectContributions).toHaveBeenCalledWith('project123');
    });
  });

  describe('confirmContribution', () => {
    it('should confirm contribution with transaction hash', async () => {
      const confirmDto = {
        transactionHash: '0x' + 'b'.repeat(64),
      };

      const confirmedContribution = {
        ...mockContribution,
        status: ContributionStatus.CONFIRMED,
        confirmedAt: new Date(),
      };

      jest.spyOn(service, 'confirmContribution').mockResolvedValue(confirmedContribution as any);

      const result = await controller.confirmContribution(
        'contribution123',
        confirmDto,
        { user: mockUser } as any,
      );

      expect(result).toEqual(confirmedContribution);
      expect(service.confirmContribution).toHaveBeenCalledWith('contribution123', confirmDto);
    });
  });

  describe('getContribution', () => {
    it('should return contribution by ID', async () => {
      jest.spyOn(service, 'getContributionById').mockResolvedValue(mockContribution as any);

      const result = await controller.getContribution(
        'contribution123',
        { user: mockUser } as any,
      );

      expect(result).toEqual(mockContribution);
    });

    it('should deny access if user is not the contributor', async () => {
      const otherUserContribution = {
        ...mockContribution,
        contributor: 'other-user',
      };

      jest.spyOn(service, 'getContributionById')
        .mockResolvedValue(otherUserContribution as any);

      await expect(
        controller.getContribution('contribution123', { user: mockUser } as any),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getContributionCount', () => {
    it('should return contribution count for project', async () => {
      jest.spyOn(service, 'getContributionCount').mockResolvedValue({ count: 5 });

      const result = await controller.getContributionCount('project123');

      expect(result).toEqual({ count: 5 });
      expect(service.getContributionCount).toHaveBeenCalledWith('project123');
    });
  });
});