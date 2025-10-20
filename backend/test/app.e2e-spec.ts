import request from "supertest";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "./../src/app.module";

// test/app.e2e-spec.ts

describe('RootRise E2E Tests', () => {
  let app: INestApplication;
  let farmerToken: string;
  let contributorToken: string;
  let governmentToken: string;
  let farmerId: string;
  let contributorId: string;
  let governmentId: string;
  let projectId: string;
  let contributionId: string;
  let withdrawalId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ==================== AUTH TESTS ====================
  describe('Authentication', () => {
    describe('POST /api/v1/auth/register', () => {
      it('should register a farmer', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            email: 'farmer@test.com',
            password: 'Password123!',
            firstName: 'John',
            lastName: 'Farmer',
            role: 'farmer',
            phoneNumber: '+250788123456',
            location: 'Kigali',
          })
          .expect(201);

        expect(response.body).toHaveProperty('token');
        expect(response.body.user.role).toBe('farmer');
        farmerToken = response.body.token;
        farmerId = response.body.user._id;
      });

      it('should register a contributor', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            email: 'contributor@test.com',
            password: 'Password123!',
            firstName: 'Jane',
            lastName: 'Contributor',
            role: 'contributor',
            phoneNumber: '+250788123457',
          })
          .expect(201);

        expect(response.body).toHaveProperty('token');
        contributorToken = response.body.token;
        contributorId = response.body.user._id;
      });

      it('should register a government official', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            email: 'government@test.com',
            password: 'Password123!',
            firstName: 'Bob',
            lastName: 'Official',
            role: 'government_official',
            phoneNumber: '+250788123458',
            department: 'agriculture',
          })
          .expect(201);

        expect(response.body).toHaveProperty('token');
        governmentToken = response.body.token;
        governmentId = response.body.user._id;
      });

      it('should fail with duplicate email', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            email: 'farmer@test.com',
            password: 'Password123!',
            firstName: 'Duplicate',
            lastName: 'User',
            role: 'farmer',
          })
          .expect(409);
      });

      it('should fail with invalid email', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/register')
          .send({
            email: 'invalid-email',
            password: 'Password123!',
            firstName: 'Test',
            lastName: 'User',
            role: 'farmer',
          })
          .expect(400);
      });
    });

    describe('POST /api/v1/auth/login', () => {
      it('should login farmer successfully', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: 'farmer@test.com',
            password: 'Password123!',
          })
          .expect(200);

        expect(response.body).toHaveProperty('token');
        expect(response.body.user.role).toBe('farmer');
      });

      it('should fail with wrong password', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: 'farmer@test.com',
            password: 'WrongPassword',
          })
          .expect(401);
      });

      it('should fail with non-existent email', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({
            email: 'nonexistent@test.com',
            password: 'Password123!',
          })
          .expect(401);
      });
    });

    describe('GET /api/v1/auth/profile', () => {
      it('should get user profile', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/auth/profile')
          .set('Authorization', `Bearer ${farmerToken}`)
          .expect(200);

        expect(response.body.email).toBe('farmer@test.com');
        expect(response.body.role).toBe('farmer');
      });

      it('should fail without token', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/auth/profile')
          .expect(401);
      });
    });

    describe('POST /api/v1/auth/update-wallet', () => {
      it('should update wallet address', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/auth/update-wallet')
          .set('Authorization', `Bearer ${farmerToken}`)
          .send({
            walletAddress: '0x1234567890123456789012345678901234567890',
          })
          .expect(200);

        expect(response.body.walletAddress).toBe('0x1234567890123456789012345678901234567890');
      });

      it('should fail with invalid wallet address', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/auth/update-wallet')
          .set('Authorization', `Bearer ${farmerToken}`)
          .send({
            walletAddress: 'invalid-address',
          })
          .expect(400);
      });
    });
  });

  // ==================== PROJECT TESTS ====================
  describe('Projects (Farmer)', () => {
    describe('POST /api/v1/projects', () => {
      it('should create a project as farmer', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/projects')
          .set('Authorization', `Bearer ${farmerToken}`)
          .send({
            title: 'Rice Farming Project',
            description: 'Growing rice in Bugesera',
            category: 'agriculture',
            fundingGoal: 1000,
            timeline: 180,
            location: 'Bugesera, Rwanda',
            images: ['https://example.com/image1.jpg'],
          })
          .expect(201);

        expect(response.body.title).toBe('Rice Farming Project');
        expect(response.body.status).toBe('draft');
        projectId = response.body._id;
      });

      it('should fail without required fields', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/projects')
          .set('Authorization', `Bearer ${farmerToken}`)
          .send({
            title: 'Incomplete Project',
          })
          .expect(400);
      });

      it('should fail as non-farmer', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/projects')
          .set('Authorization', `Bearer ${contributorToken}`)
          .send({
            title: 'Test Project',
            description: 'Test',
            category: 'agriculture',
            fundingGoal: 1000,
            timeline: 180,
            location: 'Rwanda',
          })
          .expect(403);
      });
    });

    describe('GET /api/v1/projects/my-projects', () => {
      it('should get farmer\'s projects', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/projects/my-projects')
          .set('Authorization', `Bearer ${farmerToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0].farmer).toBeDefined();
      });

      it('should filter by status', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/projects/my-projects?status=draft')
          .set('Authorization', `Bearer ${farmerToken}`)
          .expect(200);

        expect(response.body.every((p: any) => p.status === 'draft')).toBe(true);
      });
    });

    describe('GET /api/v1/projects/:id', () => {
      it('should get project by id', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/projects/${projectId}`)
          .set('Authorization', `Bearer ${farmerToken}`)
          .expect(200);

        expect(response.body._id).toBe(projectId);
        expect(response.body.title).toBe('Rice Farming Project');
      });

      it('should fail with invalid id', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/projects/invalid-id')
          .set('Authorization', `Bearer ${farmerToken}`)
          .expect(400);
      });
    });

    describe('PATCH /api/v1/projects/:id', () => {
      it('should update project', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/projects/${projectId}`)
          .set('Authorization', `Bearer ${farmerToken}`)
          .send({
            title: 'Updated Rice Farming Project',
            fundingGoal: 1500,
          })
          .expect(200);

        expect(response.body.title).toBe('Updated Rice Farming Project');
        expect(response.body.fundingGoal).toBe(1500);
      });

      it('should fail to update other farmer\'s project', async () => {
        await request(app.getHttpServer())
          .patch(`/api/v1/projects/${projectId}`)
          .set('Authorization', `Bearer ${contributorToken}`)
          .send({
            title: 'Hacked Title',
          })
          .expect(403);
      });
    });

    describe('GET /api/v1/projects/:id/blockchain-status', () => {
      it('should get blockchain status', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/projects/${projectId}/blockchain-status`)
          .set('Authorization', `Bearer ${farmerToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('blockchainEnabled');
      });
    });

    describe('DELETE /api/v1/projects/:id', () => {
      it('should delete draft project', async () => {
        await request(app.getHttpServer())
          .delete(`/api/v1/projects/${projectId}`)
          .set('Authorization', `Bearer ${farmerToken}`)
          .expect(200);
      });

      it('should fail to delete non-existent project', async () => {
        await request(app.getHttpServer())
          .delete(`/api/v1/projects/${projectId}`)
          .set('Authorization', `Bearer ${farmerToken}`)
          .expect(404);
      });
    });
  });

  // ==================== GOVERNMENT TESTS ====================
  describe('Government', () => {
    let reviewProjectId: string;

    beforeAll(async () => {
      // Create a project to review
      const projectResponse = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${farmerToken}`)
        .send({
          title: 'Project for Review',
          description: 'Test project for government review',
          category: 'agriculture',
          fundingGoal: 2000,
          timeline: 180,
          location: 'Kigali',
          status: 'submitted',
        });
      reviewProjectId = projectResponse.body._id;
    });

    describe('GET /api/v1/projects/pending/review', () => {
      it('should get pending projects', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/projects/pending/review')
          .set('Authorization', `Bearer ${governmentToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should fail without government role', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/projects/pending/review')
          .set('Authorization', `Bearer ${contributorToken}`)
          .expect(403);
      });
    });

    describe('GET /api/v1/projects/my-department', () => {
      it('should get department projects', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/projects/my-department')
          .set('Authorization', `Bearer ${governmentToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('PATCH /api/v1/projects/:id/due-diligence', () => {
      it('should update due diligence', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/projects/${reviewProjectId}/due-diligence`)
          .set('Authorization', `Bearer ${governmentToken}`)
          .send({
            notes: 'Reviewed documents, everything looks good',
            status: 'in_progress',
          })
          .expect(200);

        expect(response.body.dueDiligence.notes).toContain('everything looks good');
      });
    });

    describe('POST /api/v1/projects/:id/verify', () => {
      it('should verify project', async () => {
        const response = await request(app.getHttpServer())
          .post(`/api/v1/projects/${reviewProjectId}/verify`)
          .set('Authorization', `Bearer ${governmentToken}`)
          .expect(200);

        expect(response.body.status).toBe('active');
        expect(response.body.verification.verifiedBy).toBeDefined();
      });

      it('should fail to verify already verified project', async () => {
        await request(app.getHttpServer())
          .post(`/api/v1/projects/${reviewProjectId}/verify`)
          .set('Authorization', `Bearer ${governmentToken}`)
          .expect(400);
      });
    });

    describe('POST /api/v1/projects/:id/reject', () => {
      it('should reject project', async () => {
        // Create another project to reject
        const projectResponse = await request(app.getHttpServer())
          .post('/api/v1/projects')
          .set('Authorization', `Bearer ${farmerToken}`)
          .send({
            title: 'Project to Reject',
            description: 'Will be rejected',
            category: 'agriculture',
            fundingGoal: 1000,
            timeline: 180,
            location: 'Kigali',
            status: 'submitted',
          });

        const response = await request(app.getHttpServer())
          .post(`/api/v1/projects/${projectResponse.body._id}/reject`)
          .set('Authorization', `Bearer ${governmentToken}`)
          .send({
            reason: 'Incomplete documentation',
          })
          .expect(200);

        expect(response.body.status).toBe('rejected');
        expect(response.body.verification.rejectionReason).toBe('Incomplete documentation');
      });
    });

    describe('GET /api/v1/projects/government/dashboard', () => {
      it('should get government dashboard stats', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/projects/government/dashboard')
          .set('Authorization', `Bearer ${governmentToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('pendingReview');
        expect(response.body).toHaveProperty('underReview');
        expect(response.body).toHaveProperty('approved');
      });
    });
  });

  // ==================== CONTRIBUTOR TESTS ====================
  describe('Contributors', () => {
    describe('GET /api/v1/projects/verified/list', () => {
      it('should get verified projects', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/projects/verified/list')
          .set('Authorization', `Bearer ${contributorToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should filter by category', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/projects/verified/list?category=agriculture')
          .set('Authorization', `Bearer ${contributorToken}`)
          .expect(200);

        expect(response.body.every((p: any) => p.category === 'agriculture')).toBe(true);
      });
    });

    describe('POST /api/v1/projects/:id/favorite', () => {
      it('should add project to favorites', async () => {
        // Use verified project
        const projects = await request(app.getHttpServer())
          .get('/api/v1/projects/verified/list')
          .set('Authorization', `Bearer ${contributorToken}`);

        if (projects.body.length > 0) {
          const projectId = projects.body[0]._id;
          
          const response = await request(app.getHttpServer())
            .post(`/api/v1/projects/${projectId}/favorite`)
            .set('Authorization', `Bearer ${contributorToken}`)
            .expect(200);

          expect(response.body.message).toContain('favorites');
        }
      });
    });

    describe('GET /api/v1/projects/favorites', () => {
      it('should get user favorites', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/projects/favorites')
          .set('Authorization', `Bearer ${contributorToken}`)
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('GET /api/v1/projects/:id/is-favorite', () => {
      it('should check if project is favorite', async () => {
        const projects = await request(app.getHttpServer())
          .get('/api/v1/projects/verified/list')
          .set('Authorization', `Bearer ${contributorToken}`);

        if (projects.body.length > 0) {
          const projectId = projects.body[0]._id;
          
          const response = await request(app.getHttpServer())
            .get(`/api/v1/projects/${projectId}/is-favorite`)
            .set('Authorization', `Bearer ${contributorToken}`)
            .expect(200);

          expect(response.body).toHaveProperty('isFavorite');
        }
      });
    });
  });

  // ==================== CONTRIBUTION TESTS ====================
  describe('Contributions', () => {
    let testProjectId: string;

    beforeAll(async () => {
      // Get a verified project
      const projects = await request(app.getHttpServer())
        .get('/api/v1/projects/verified/list')
        .set('Authorization', `Bearer ${contributorToken}`);
      
      if (projects.body.length > 0) {
        testProjectId = projects.body[0]._id;
      }
    });

    describe('POST /api/v1/contributions', () => {
      it('should create a contribution', async () => {
        const response = await request(app.getHttpServer())
          .post('/api/v1/contributions')
          .set('Authorization', `Bearer ${contributorToken}`)
          .send({
            projectId: testProjectId,
            amount: 0.1,
            currency: 'ETH',
            transactionHash: '0xabc123def456',
          })
          .expect(201);

        expect(response.body.amount).toBe(0.1);
        expect(response.body.status).toBe('pending');
        contributionId = response.body._id;
      });

      it('should fail with invalid project id', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/contributions')
          .set('Authorization', `Bearer ${contributorToken}`)
          .send({
            projectId: 'invalid-id',
            amount: 0.1,
            currency: 'ETH',
          })
          .expect(400);
      });

      it('should fail with negative amount', async () => {
        await request(app.getHttpServer())
          .post('/api/v1/contributions')
          .set('Authorization', `Bearer ${contributorToken}`)
          .send({
            projectId: testProjectId,
            amount: -0.1,
            currency: 'ETH',
          })
          .expect(400);
      });
    });

    describe('GET /api/v1/contributions/my-contributions', () => {
      it('should get user contributions', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/contributions/my-contributions')
          .set('Authorization', `Bearer ${contributorToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('contributions');
        expect(Array.isArray(response.body.contributions)).toBe(true);
      });

      it('should support pagination', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/contributions/my-contributions?page=1&limit=5')
          .set('Authorization', `Bearer ${contributorToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('page', 1);
        expect(response.body).toHaveProperty('limit', 5);
      });
    });

    describe('GET /api/v1/contributions/my-stats', () => {
      it('should get contribution stats', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/contributions/my-stats')
          .set('Authorization', `Bearer ${contributorToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('totalContributions');
        expect(response.body).toHaveProperty('totalAmount');
        expect(response.body).toHaveProperty('totalProjects');
      });
    });

    describe('GET /api/v1/contributions/:id', () => {
      it('should get single contribution', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/contributions/${contributionId}`)
          .set('Authorization', `Bearer ${contributorToken}`)
          .expect(200);

        expect(response.body._id).toBe(contributionId);
      });
    });

    describe('GET /api/v1/contributions/project/:projectId', () => {
      it('should get project contributions', async () => {
        const response = await request(app.getHttpServer())
          .get(`/api/v1/contributions/project/${testProjectId}`)
          .set('Authorization', `Bearer ${contributorToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('contributions');
        expect(Array.isArray(response.body.contributions)).toBe(true);
      });
    });

    describe('PATCH /api/v1/contributions/:id/confirm', () => {
      it('should confirm contribution', async () => {
        const response = await request(app.getHttpServer())
          .patch(`/api/v1/contributions/${contributionId}/confirm`)
          .set('Authorization', `Bearer ${contributorToken}`)
          .expect(200);

        expect(response.body.status).toBe('confirmed');
        expect(response.body.blockchainConfirmed).toBe(true);
      });
    });

    describe('GET /api/v1/contributions/utils/eth-to-rwf', () => {
      it('should convert ETH to RWF', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/contributions/utils/eth-to-rwf?ethAmount=1')
          .expect(200);

        expect(response.body).toHaveProperty('ethAmount');
        expect(response.body).toHaveProperty('rwfAmount');
        expect(response.body).toHaveProperty('exchangeRate');
      });
    });

    describe('GET /api/v1/contributions/stats/platform', () => {
      it('should get platform stats (admin)', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/contributions/stats/platform')
          .set('Authorization', `Bearer ${governmentToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('totalContributions');
        expect(response.body).toHaveProperty('totalAmount');
      });

      it('should fail without admin role', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/contributions/stats/platform')
          .set('Authorization', `Bearer ${contributorToken}`)
          .expect(403);
      });
    });
  });

  // ==================== WITHDRAWAL TESTS ====================
  describe('Withdrawals', () => {
    describe('POST /api/v1/contributions/withdraw', () => {
      it('should create withdrawal request', async () => {
        // Get farmer's funded project
        const projects = await request(app.getHttpServer())
          .get('/api/v1/projects/my-projects?status=active')
          .set('Authorization', `Bearer ${farmerToken}`);

        if (projects.body.length > 0) {
          const response = await request(app.getHttpServer())
            .post('/api/v1/contributions/withdraw')
            .set('Authorization', `Bearer ${farmerToken}`)
            .send({
              projectId: projects.body[0]._id,
              amount: 500000,
              currency: 'RWF',
              withdrawalMethod: 'bank',
              bankDetails: {
                accountName: 'John Farmer',
                accountNumber: '1234567890',
                bankName: 'Bank of Kigali',
              },
            })
            .expect(201);

          expect(response.body.status).toBe('pending');
          withdrawalId = response.body._id;
        }
      });

      it('should fail with invalid bank details', async () => {
        const projects = await request(app.getHttpServer())
          .get('/api/v1/projects/my-projects')
          .set('Authorization', `Bearer ${farmerToken}`);

        if (projects.body.length > 0) {
          await request(app.getHttpServer())
            .post('/api/v1/contributions/withdraw')
            .set('Authorization', `Bearer ${farmerToken}`)
            .send({
              projectId: projects.body[0]._id,
              amount: 500000,
              currency: 'RWF',
              withdrawalMethod: 'bank',
              // Missing bank details
            })
            .expect(400);
        }
      });
    });

    describe('GET /api/v1/contributions/withdrawals/my-withdrawals', () => {
      it('should get farmer withdrawals', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/contributions/withdrawals/my-withdrawals')
          .set('Authorization', `Bearer ${farmerToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('withdrawals');
        expect(Array.isArray(response.body.withdrawals)).toBe(true);
      });
    });

    describe('GET /api/v1/contributions/withdrawals/pending', () => {
      it('should get pending withdrawals (admin)', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/contributions/withdrawals/pending')
          .set('Authorization', `Bearer ${governmentToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('withdrawals');
      });

      it('should fail without admin role', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/contributions/withdrawals/pending')
          .set('Authorization', `Bearer ${contributorToken}`)
          .expect(403);
      });
    });

    describe('PATCH /api/v1/contributions/withdrawals/:id/process', () => {
      it('should process withdrawal (admin)', async () => {
        if (withdrawalId) {
          const response = await request(app.getHttpServer())
            .patch(`/api/v1/contributions/withdrawals/${withdrawalId}/process`)
            .set('Authorization', `Bearer ${governmentToken}`)
            .send({
              status: 'completed',
              transactionReference: 'TXN-12345',
              notes: 'Payment processed successfully',
            })
            .expect(200);

          expect(response.body.status).toBe('completed');
        }
      });

      it('should fail without admin role', async () => {
        if (withdrawalId) {
          await request(app.getHttpServer())
            .patch(`/api/v1/contributions/withdrawals/${withdrawalId}/process`)
            .set('Authorization', `Bearer ${farmerToken}`)
            .send({
              status: 'completed',
            })
            .expect(403);
        }
      });
    });
  });

  // ==================== PROJECT STATS TESTS ====================
  describe('Project Statistics', () => {
    describe('GET /api/v1/projects/stats/dashboard', () => {
      it('should get dashboard stats', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/projects/stats/dashboard')
          .set('Authorization', `Bearer ${contributorToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('totalProjects');
        expect(response.body).toHaveProperty('activeProjects');
        expect(response.body).toHaveProperty('totalFunding');
      });
    });
  });

  // ==================== FILE UPLOAD TESTS ====================
  describe('File Upload', () => {
    describe('POST /api/v1/upload/image', () => {
      it('should upload single image', async () => {
        // Note: This requires actual file upload with multipart/form-data
        // You'll need to mock Cloudinary or use actual image file
      });
    });

    describe('POST /api/v1/upload/images', () => {
      it('should upload multiple images', async () => {
        // Similar to single image upload
      });
    });
  });

  // ==================== HEALTH CHECK ====================
  describe('Health Check', () => {
    it('GET /health should return 200', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
    });
  });
});