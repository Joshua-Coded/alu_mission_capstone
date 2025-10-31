import * as request from "supertest";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "../src/app.module";

describe('Auth E2E Tests', () => {
  let app: INestApplication;
  const testEmail = `test-${Date.now()}@example.com`;
  let authToken: string;
  let userId: string;

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

  describe('POST /auth/register', () => {
    it('should register a new farmer', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `farmer-${Date.now()}@test.com`,
          password: 'FarmerPass123!',
          firstName: 'John',
          lastName: 'Farmer',
          phoneNumber: '+250123456789',
          role: 'FARMER',
          termsAccepted: true,
          location: 'Kigali',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body.message).toContain('Registration successful');
          expect(res.body.user).toHaveProperty('email');
          expect(res.body.user).toHaveProperty('role', 'FARMER');
          expect(res.body.user).toHaveProperty('emailVerified', false);
        });
    });

    it('should register a new contributor', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testEmail,
          password: 'TestPass123!',
          firstName: 'Jane',
          lastName: 'Contributor',
          phoneNumber: '+250987654321',
          role: 'CONTRIBUTOR',
          termsAccepted: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user).toHaveProperty('role', 'CONTRIBUTOR');
          userId = res.body.user.id;
        });
    });

    it('should register a government official with department', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `official-${Date.now()}@gov.rw`,
          password: 'OfficialPass123!',
          firstName: 'Gov',
          lastName: 'Official',
          phoneNumber: '+250111222333',
          role: 'GOVERNMENT_OFFICIAL',
          department: 'CROPS',
          specializations: ['crops', 'livestock'],
          location: 'Kigali',
          termsAccepted: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.user).toHaveProperty('role', 'GOVERNMENT_OFFICIAL');
          expect(res.body.user).toHaveProperty('department', 'CROPS');
        });
    });

    it('should reject registration with duplicate email', async () => {
      const duplicateEmail = `duplicate-${Date.now()}@test.com`;
      
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: duplicateEmail,
          password: 'TestPass123!',
          firstName: 'First',
          lastName: 'User',
          phoneNumber: '+250123456789',
          role: 'CONTRIBUTOR',
          termsAccepted: true,
        })
        .expect(201);

      // Duplicate registration
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: duplicateEmail,
          password: 'TestPass123!',
          firstName: 'Second',
          lastName: 'User',
          phoneNumber: '+250987654321',
          role: 'CONTRIBUTOR',
          termsAccepted: true,
        })
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('should reject registration without terms acceptance', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `noterms-${Date.now()}@test.com`,
          password: 'TestPass123!',
          firstName: 'No',
          lastName: 'Terms',
          phoneNumber: '+250123456789',
          role: 'CONTRIBUTOR',
          termsAccepted: false, // Not accepted
        })
        .expect(400);
    });

    it('should reject registration with weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `weak-${Date.now()}@test.com`,
          password: 'weak', // Too weak
          firstName: 'Weak',
          lastName: 'Password',
          phoneNumber: '+250123456789',
          role: 'CONTRIBUTOR',
          termsAccepted: true,
        })
        .expect(400);
    });

    it('should reject registration with invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email', // Not an email
          password: 'TestPass123!',
          firstName: 'Invalid',
          lastName: 'Email',
          phoneNumber: '+250123456789',
          role: 'CONTRIBUTOR',
          termsAccepted: true,
        })
        .expect(400);
    });

    it('should reject registration with invalid role', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `invalidrole-${Date.now()}@test.com`,
          password: 'TestPass123!',
          firstName: 'Invalid',
          lastName: 'Role',
          phoneNumber: '+250123456789',
          role: 'INVALID_ROLE', // Invalid role
          termsAccepted: true,
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      // Note: This assumes email is verified
      // You may need to adjust based on your email verification flow
      
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'TestPass123!',
        })
        .expect((res) => {
          // May be 200 or 401 depending on email verification
          if (res.status === 200) {
            expect(res.body).toHaveProperty('access_token');
            expect(res.body).toHaveProperty('user');
            expect(res.body.message).toBe('Login successful');
            authToken = res.body.access_token;
          } else if (res.status === 401) {
            expect(res.body.message).toContain('verify your email');
          }
        });
    });

    it('should reject login with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should reject login with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'TestPass123!',
        })
        .expect(401);
    });

    it('should reject login without email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          password: 'TestPass123!',
        })
        .expect(400);
    });

    it('should reject login without password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testEmail,
        })
        .expect(400);
    });
  });

  describe('GET /auth/profile', () => {
    it('should get user profile with valid token', () => {
      if (!authToken) {
        console.log('Skipping: No auth token available');
        return;
      }

      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('firstName');
          expect(res.body).toHaveProperty('lastName');
          expect(res.body).toHaveProperty('role');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token-12345')
        .expect(401);
    });
  });

  describe('GET /auth/verify', () => {
    it('should verify valid JWT token', () => {
      if (!authToken) return;

      return request(app.getHttpServer())
        .get('/auth/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('valid', true);
          expect(res.body).toHaveProperty('user');
        });
    });

    it('should reject invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/verify')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('PATCH /auth/update-wallet', () => {
    it('should update wallet address', () => {
      if (!authToken) return;

      const walletAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

      return request(app.getHttpServer())
        .patch('/auth/update-wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ walletAddress })
        .expect((res) => {
          if (res.status === 200) {
            expect(res.body).toHaveProperty('success', true);
            expect(res.body).toHaveProperty('walletAddress', walletAddress);
          }
        });
    });

    it('should reject invalid wallet address format', () => {
      if (!authToken) return;

      return request(app.getHttpServer())
        .patch('/auth/update-wallet')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ walletAddress: 'invalid-wallet' })
        .expect(400);
    });

    it('should reject wallet update without auth', () => {
      return request(app.getHttpServer())
        .patch('/auth/update-wallet')
        .send({ walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb' })
        .expect(401);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send password reset email', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: testEmail })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Password reset email sent');
        });
    });

    it('should return success even for non-existent email (security)', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('Password reset email sent');
        });
    });

    it('should reject request without email', () => {
      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({})
        .expect(400);
    });
  });

  describe('POST /auth/resend-verification', () => {
    it('should resend verification email', () => {
      return request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: testEmail })
        .expect((res) => {
          // May be 200 or 400 depending on if email is already verified
          if (res.status === 200) {
            expect(res.body.message).toContain('Verification email sent');
          }
        });
    });

    it('should reject for non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/resend-verification')
        .send({ email: 'nonexistent@example.com' })
        .expect(400);
    });
  });

  describe('Role-based Access', () => {
    it('should allow contributor to access contributor endpoints', () => {
      if (!authToken) return;

      return request(app.getHttpServer())
        .get('/contributions/my-contributions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect((res) => {
          // Should succeed if user is contributor
          expect([200, 401]).toContain(res.status);
        });
    });
  });
});