import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { BlockchainService } from "./blockchain.service";

// Mock ethers.js
jest.mock('ethers', () => ({
  JsonRpcProvider: jest.fn(),
  Wallet: jest.fn(),
  Contract: jest.fn(),
  formatEther: jest.fn((value) => value.toString()),
  parseEther: jest.fn((value) => BigInt(value)),
}));

describe('BlockchainService', () => {
  let service: BlockchainService;
  let configService: ConfigService;
  let mockProvider: any;
  let mockWallet: any;
  let mockContract: any;

  const mockConfig = {
    POLYGON_RPC_URL: 'https://polygon-rpc.com',
    PRIVATE_KEY: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    CONTRACT_ADDRESS: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  };

  beforeEach(async () => {
    // Setup mock provider
    mockProvider = {
      getNetwork: jest.fn().mockResolvedValue({ chainId: 137n, name: 'matic' }),
      getBalance: jest.fn().mockResolvedValue(BigInt('1000000000000000000')), // 1 MATIC
    };

    // Setup mock wallet
    mockWallet = {
      address: '0xAdminWalletAddress123456789',
    };

    // Setup mock contract
    mockContract = {
      target: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      interface: {
        parseLog: jest.fn(),
      },
      getProjectsCount: jest.fn().mockResolvedValue(BigInt(5)),
      platformFeePercentage: jest.fn().mockResolvedValue(BigInt(5)),
      createProject: jest.fn(),
      getProjectInfo: jest.fn(),
      setProjectActive: jest.fn(),
      getContributorAmount: jest.fn(),
      getContributorCount: jest.fn(),
      getContractBalance: jest.fn(),
    };

    // Mock the constructors
    const { JsonRpcProvider, Wallet, Contract } = require('ethers');
    JsonRpcProvider.mockImplementation(() => mockProvider);
    Wallet.mockImplementation(() => mockWallet);
    Contract.mockImplementation(() => mockContract);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfig[key]),
          },
        },
      ],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize blockchain connection successfully', async () => {
      await service.onModuleInit();

      expect(configService.get).toHaveBeenCalledWith('POLYGON_RPC_URL');
      expect(configService.get).toHaveBeenCalledWith('PRIVATE_KEY');
      expect(configService.get).toHaveBeenCalledWith('CONTRACT_ADDRESS');
      expect(mockProvider.getNetwork).toHaveBeenCalled();
      expect(mockProvider.getBalance).toHaveBeenCalled();
      expect(mockContract.getProjectsCount).toHaveBeenCalled();
      expect(mockContract.platformFeePercentage).toHaveBeenCalled();
      expect(service.isConnected()).toBe(true);
    });

    it('should handle missing configuration gracefully', async () => {
      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      await service.onModuleInit();

      expect(service.isConnected()).toBe(false);
    });

    it('should handle initialization errors gracefully', async () => {
      mockProvider.getNetwork.mockRejectedValueOnce(new Error('Network error'));

      await service.onModuleInit();

      expect(service.isConnected()).toBe(false);
    });
  });

  describe('createProjectOnChain', () => {
    const projectData = {
      title: 'Test Farm Project',
      description: 'A test farming project',
      fundingGoal: 1000,
      category: 'CROPS',
      location: 'Kigali',
      timeline: 180,
      farmerWallet: '0xFarmerWallet123',
    };

    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should create a project successfully', async () => {
      const mockReceipt = {
        hash: '0xtxhash123',
        logs: [
          {
            topics: ['0xtopic1', '0xtopic2'],
            data: '0xdata',
          },
        ],
      };

      mockContract.createProject.mockResolvedValue({
        wait: jest.fn().mockResolvedValue(mockReceipt),
      });

      mockContract.interface.parseLog.mockReturnValue({
        name: 'ProjectCreated',
        args: { projectId: BigInt(6) },
      });

      const result = await service.createProjectOnChain(projectData);

      expect(mockContract.createProject).toHaveBeenCalledWith(
        projectData.farmerWallet,
        projectData.title,
        projectData.description,
        expect.any(BigInt),
        projectData.category,
        projectData.location,
        projectData.timeline
      );
      expect(result).toEqual({
        projectId: 6,
        txHash: '0xtxhash123',
      });
    });

    it('should throw error if blockchain not initialized', async () => {
      const uninitializedService = new BlockchainService(configService);

      await expect(
        uninitializedService.createProjectOnChain(projectData)
      ).rejects.toThrow('Blockchain not initialized');
    });

    it('should handle transaction failures', async () => {
      mockContract.createProject.mockRejectedValue(new Error('Transaction failed'));

      await expect(service.createProjectOnChain(projectData)).rejects.toThrow(
        'Transaction failed'
      );
    });

    it('should parse project ID from transaction logs', async () => {
      const mockReceipt = {
        hash: '0xtxhash456',
        logs: [
          {
            topics: ['0xOtherEvent'],
            data: '0xdata1',
          },
          {
            topics: ['0xProjectCreated'],
            data: '0xdata2',
          },
        ],
      };

      mockContract.createProject.mockResolvedValue({
        wait: jest.fn().mockResolvedValue(mockReceipt),
      });

      mockContract.interface.parseLog
        .mockReturnValueOnce(null)
        .mockReturnValueOnce({
          name: 'ProjectCreated',
          args: { projectId: BigInt(10) },
        });

      const result = await service.createProjectOnChain(projectData);

      expect(result.projectId).toBe(10);
    });
  });

  describe('getProjectInfo', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should get project info successfully', async () => {
      const mockProjectInfo = [
        '0xOwnerAddress',
        BigInt('1000000000000000000'), // 1 ETH
        BigInt('500000000000000000'), // 0.5 ETH
        true, // isActive
        false, // isCompleted
        false, // fundsReleased
        BigInt(Math.floor(Date.now() / 1000) + 86400), // deadline
      ];

      mockContract.getProjectInfo.mockResolvedValue(mockProjectInfo);

      const result = await service.getProjectInfo(1);

      expect(mockContract.getProjectInfo).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        owner: '0xOwnerAddress',
        fundingGoal: BigInt('1000000000000000000'),
        totalFunding: BigInt('500000000000000000'),
        isActive: true,
        isCompleted: false,
        fundsReleased: false,
        fundingDeadline: mockProjectInfo[6],
      });
    });

    it('should throw error if blockchain not initialized', async () => {
      const uninitializedService = new BlockchainService(configService);

      await expect(uninitializedService.getProjectInfo(1)).rejects.toThrow(
        'Blockchain not initialized'
      );
    });

    it('should handle contract errors', async () => {
      mockContract.getProjectInfo.mockRejectedValue(new Error('Project not found'));

      await expect(service.getProjectInfo(999)).rejects.toThrow('Project not found');
    });
  });

  describe('getProjectFromChain', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should get formatted project data', async () => {
      const mockProjectInfo = [
        '0xOwnerAddress',
        BigInt('1000000000000000000'),
        BigInt('500000000000000000'),
        true,
        false,
        false,
        BigInt(1735689600), // Unix timestamp
      ];

      mockContract.getProjectInfo.mockResolvedValue(mockProjectInfo);

      const result = await service.getProjectFromChain(1);

      expect(result).toHaveProperty('owner', '0xOwnerAddress');
      expect(result).toHaveProperty('isActive', true);
      expect(result).toHaveProperty('fundingDeadline');
      expect(result.fundingDeadline).toBeInstanceOf(Date);
    });
  });

  describe('setProjectActive', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should activate a project', async () => {
      const mockReceipt = { hash: '0xtxhash789' };
      mockContract.setProjectActive.mockResolvedValue({
        wait: jest.fn().mockResolvedValue(mockReceipt),
      });

      const result = await service.setProjectActive(1, true);

      expect(mockContract.setProjectActive).toHaveBeenCalledWith(1, true);
      expect(result).toBe('0xtxhash789');
    });

    it('should deactivate a project', async () => {
      const mockReceipt = { hash: '0xtxhash999' };
      mockContract.setProjectActive.mockResolvedValue({
        wait: jest.fn().mockResolvedValue(mockReceipt),
      });

      const result = await service.setProjectActive(2, false);

      expect(mockContract.setProjectActive).toHaveBeenCalledWith(2, false);
      expect(result).toBe('0xtxhash999');
    });

    it('should throw error if not initialized', async () => {
      const uninitializedService = new BlockchainService(configService);

      await expect(uninitializedService.setProjectActive(1, true)).rejects.toThrow(
        'Not initialized'
      );
    });
  });

  describe('getContributorAmount', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should get contributor amount', async () => {
      mockContract.getContributorAmount.mockResolvedValue(
        BigInt('250000000000000000')
      );

      const result = await service.getContributorAmount(1, '0xContributor123');

      expect(mockContract.getContributorAmount).toHaveBeenCalledWith(
        1,
        '0xContributor123'
      );
      expect(result).toBe('250000000000000000');
    });
  });

  describe('getContributorCount', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should get contributor count', async () => {
      mockContract.getContributorCount.mockResolvedValue(BigInt(15));

      const result = await service.getContributorCount(1);

      expect(mockContract.getContributorCount).toHaveBeenCalledWith(1);
      expect(result).toBe(15);
    });
  });

  describe('getContractBalance', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should get contract balance', async () => {
      mockContract.getContractBalance.mockResolvedValue(
        BigInt('5000000000000000000')
      );

      const result = await service.getContractBalance();

      expect(mockContract.getContractBalance).toHaveBeenCalled();
      expect(result).toBe('5000000000000000000');
    });
  });

  describe('getTotalProjectsCount', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should get total projects count', async () => {
      mockContract.getProjectsCount.mockResolvedValue(BigInt(42));

      const result = await service.getTotalProjectsCount();

      expect(mockContract.getProjectsCount).toHaveBeenCalled();
      expect(result).toBe(42);
    });
  });

  describe('utility methods', () => {
    it('should return connection status', async () => {
      expect(service.isConnected()).toBe(false);

      await service.onModuleInit();

      expect(service.isConnected()).toBe(true);
    });

    it('should return wallet address when connected', async () => {
      await service.onModuleInit();

      const address = service.getWalletAddress();

      expect(address).toBe('0xAdminWalletAddress123456789');
    });

    it('should return "Not connected" when not initialized', () => {
      const address = service.getWalletAddress();

      expect(address).toBe('Not connected');
    });

    it('should return contract address when connected', async () => {
      await service.onModuleInit();

      const address = service.getContractAddress();

      expect(address).toBe('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
    });

    it('should return "Not connected" for contract address when not initialized', () => {
      const address = service.getContractAddress();

      expect(address).toBe('Not connected');
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      await service.onModuleInit();
    });

    it('should handle network errors in createProject', async () => {
      mockContract.createProject.mockRejectedValue(
        new Error('Network timeout')
      );

      await expect(
        service.createProjectOnChain({
          title: 'Test',
          description: 'Test',
          fundingGoal: 1000,
          category: 'CROPS',
          location: 'Kigali',
          timeline: 180,
          farmerWallet: '0xTest',
        })
      ).rejects.toThrow('Network timeout');
    });

    it('should handle invalid project ID in getProjectInfo', async () => {
      mockContract.getProjectInfo.mockRejectedValue(
        new Error('Invalid project ID')
      );

      await expect(service.getProjectInfo(-1)).rejects.toThrow(
        'Invalid project ID'
      );
    });
  });
});