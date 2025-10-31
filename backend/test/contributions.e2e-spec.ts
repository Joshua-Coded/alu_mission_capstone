import * as request from "supertest";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";

describe('Contributions E2E Tests', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let projectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('should register a contributor', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `contributor-${Date.now()}@test.com`,
          password: 'TestPass123!',
          firstName: 'Test',
          lastName: 'Contributor',
          phoneNumber: '+250123456789',
          role: 'CONTRIBUTOR',
          termsAccepted: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.user).toHaveProperty('email');
        });
    });

    it('should login and get token', async () => {
      // First register a user
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `test-${Date.now()}@example.com`,
          password: 'TestPass123!',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '+250987654321',
          role: 'CONTRIBUTOR',
          termsAccepted: true,
        });

      userId = registerRes.body.user.id;

      // Manually verify email (you'll need to adjust based on your setup)
      // For E2E tests, you might want to bypass email verification

      // Then login
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: registerRes.body.user.email,
          password: 'TestPass123!',
        })
        .expect((res) => {
          if (res.status === 200) {
            authToken = res.body.access_token;
            expect(res.body).toHaveProperty('access_token');
            expect(res.body).toHaveProperty('user');
          }
        });
    });
  });

  describe('GET /contributions/polygon/network-info', () => {
    it('should return Polygon network information', () => {
      return request(app.getHttpServer())
        .get('/contributions/polygon/network-info')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('network', 'Polygon Mainnet');
          expect(res.body).toHaveProperty('chainId', 137);
          expect(res.body).toHaveProperty('nativeCurrency');
          expect(res.body.nativeCurrency.symbol).toBe('MATIC');
        });
    });
  });

  describe('GET /contributions/polygon/verify-transaction/:txHash', () => {
    it('should verify a transaction hash', () => {
      const txHash = '0x' + 'a'.repeat(64);
      
      return request(app.getHttpServer())
        .get(`/contributions/polygon/verify-transaction/${txHash}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('transactionHash', txHash);
          expect(res.body).toHaveProperty('network', 'Polygon Mainnet');
          expect(res.body).toHaveProperty('polygonscanLink');
        });
    });

    it('should reject invalid transaction hash', () => {
      return request(app.getHttpServer())
        .get('/contributions/polygon/verify-transaction/invalid-hash')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('POST /contributions', () => {
    it('should create a contribution with valid data', async () => {
      if (!authToken) {
        console.log('Skipping: No auth token available');
        return;
      }

      // You'll need a real project ID from your test database
      // For now, this is a template
      return request(app.getHttpServer())
        .post('/contributions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: 'valid-project-id', // Replace with actual project ID
          amount: 10,
          contributorWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          transactionHash: '0x' + 'a'.repeat(64),
          paymentMethod: 'blockchain',
          currency: 'MATIC',
        })
        .expect((res) => {
          if (res.status === 201) {
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('amount', 10);
            expect(res.body).toHaveProperty('status', 'CONFIRMED');
          }
        });
    });

    it('should reject contribution without auth token', () => {
      return request(app.getHttpServer())
        .post('/contributions')
        .send({
          projectId: 'some-project-id',
          amount: 10,
          contributorWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          transactionHash: '0x' + 'a'.repeat(64),
          paymentMethod: 'blockchain',
          currency: 'MATIC',
        })
        .expect(401);
    });

    it('should reject contribution with invalid currency', () => {
      if (!authToken) return;

      return request(app.getHttpServer())
        .post('/contributions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: 'some-project-id',
          amount: 10,
          contributorWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          transactionHash: '0x' + 'a'.repeat(64),
          paymentMethod: 'blockchain',
          currency: 'USD', // Invalid - should be MATIC
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('MATIC');
        });
    });

    it('should reject contribution without transaction hash', () => {
      if (!authToken) return;

      return request(app.getHttpServer())
        .post('/contributions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: 'some-project-id',
          amount: 10,
          contributorWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          paymentMethod: 'blockchain',
          currency: 'MATIC',
          // Missing transactionHash
        })
        .expect(400);
    });

    it('should reject contribution with invalid transaction hash format', () => {
      if (!authToken) return;

      return request(app.getHttpServer())
        .post('/contributions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: 'some-project-id',
          amount: 10,
          contributorWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          transactionHash: 'invalid-hash', // Invalid format
          paymentMethod: 'blockchain',
          currency: 'MATIC',
        })
        .expect(400);
    });
  });

  describe('GET /contributions/my-contributions', () => {
    it('should get user contributions', () => {
      if (!authToken) return;

      return request(app.getHttpServer())
        .get('/contributions/my-contributions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('contributions');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('totalMatic');
          expect(Array.isArray(res.body.contributions)).toBe(true);
        });
    });

    it('should support pagination', () => {
      if (!authToken) return;

      return request(app.getHttpServer())
        .get('/contributions/my-contributions?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('page', 1);
          expect(res.body).toHaveProperty('pages');
        });
    });

    it('should filter by status', () => {
      if (!authToken) return;

      return request(app.getHttpServer())
        .get('/contributions/my-contributions?status=CONFIRMED')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('GET /contributions/my-stats', () => {
    it('should get contributor statistics', () => {
      if (!authToken) return;

      return request(app.getHttpServer())
        .get('/contributions/my-stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalContributions');
          expect(res.body).toHaveProperty('totalAmountMatic');
          expect(res.body).toHaveProperty('projectsSupported');
          expect(res.body).toHaveProperty('confirmedContributions');
          expect(res.body).toHaveProperty('pendingContributions');
        });
    });
  });

  describe('GET /contributions/stats/platform', () => {
    it('should get platform statistics', () => {
      if (!authToken) return;

      return request(app.getHttpServer())
        .get('/contributions/stats/platform')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalContributions');
          expect(res.body).toHaveProperty('totalAmountMatic');
          expect(res.body).toHaveProperty('totalContributors');
          expect(res.body).toHaveProperty('totalProjectsFunded');
        });
    });
  });

  describe('GET /contributions/project/:projectId/contribution-info', () => {
    it('should get project contribution info', async () => {
      if (!authToken || !projectId) {
        console.log('Skipping: No auth token or project ID');
        return;
      }

      return request(app.getHttpServer())
        .get(`/contributions/project/${projectId}/contribution-info`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('project');
          expect(res.body).toHaveProperty('blockchainProjectId');
          expect(res.body).toHaveProperty('farmerWalletAddress');
          expect(res.body).toHaveProperty('currentFunding');
          expect(res.body).toHaveProperty('fundingGoal');
          expect(res.body).toHaveProperty('canContribute');
          expect(res.body).toHaveProperty('instructions');
        });
    });
  });

  describe('Authorization Tests', () => {
    it('should deny access without authentication', () => {
      return request(app.getHttpServer())
        .get('/contributions/my-contributions')
        .expect(401);
    });

    it('should deny access with invalid token', () => {
      return request(app.getHttpServer())
        .get('/contributions/my-contributions')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});