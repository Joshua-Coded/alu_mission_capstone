import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // ✅ ENHANCED CORS CONFIGURATION
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const renderUrl = configService.get<string>('RENDER_EXTERNAL_URL');
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const allowedOriginsEnv = configService.get<string>('ALLOWED_ORIGINS');
  
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'https://localhost:3000',
    // ✅ Add your Vercel deployment URL
    'https://alu-mission-capstone-zc78.vercel.app',
  ];

  // Add frontend URL from environment
  if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
    // Also add with trailing slash
    allowedOrigins.push(`${frontendUrl}/`);
  }

  // Add Render external URL
  if (isProduction && renderUrl) {
    allowedOrigins.push(renderUrl);
  }

  // Add additional origins from environment variable
  if (allowedOriginsEnv) {
    const additionalOrigins = allowedOriginsEnv.split(',').map(origin => origin.trim());
    allowedOrigins.push(...additionalOrigins);
  }

  // ✅ IMPROVED CORS WITH WILDCARD SUPPORT
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview deployments
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Allow all localhost with any port
      if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
        return callback(null, true);
      }

      // In development, allow all origins
      if (!isProduction) {
        return callback(null, true);
      }

      // Reject in production
      logger.warn(`⚠️ CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type', 
      'Authorization', 
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);

  // Log allowed origins for debugging
  logger.log(`🌍 CORS enabled for origins:`);
  allowedOrigins.forEach(origin => logger.log(`   - ${origin}`));
  logger.log(`   - *.vercel.app (all Vercel deployments)`);
  logger.log(`   - localhost:* (all localhost ports)`);

  // Enhanced Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('RootRise API')
    .setDescription(`
## RootRise Blockchain Farmer Funding Platform API

### Overview
RootRise connects farmers with contributors through a transparent blockchain-powered funding platform.

### User Roles
- **Farmers**: Create and manage agricultural projects
- **Government Officials**: Review, verify, and approve projects
- **Contributors**: Browse and fund verified projects

### Authentication
All protected endpoints require a valid JWT token:
\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### Base URLs
- Development: http://localhost:3001/api/v1
- Production: https://rootrise.onrender.com/api/v1

### Features
- 🔐 Secure authentication with email verification
- 🔑 Password reset functionality
- 🌾 Project creation and management
- 🏛️ Government due diligence workflow
- 💰 Contributor funding and favorites
- 📤 Cloudinary file uploads
- 📊 Platform statistics
    `)
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication - Register, Login, Email Verification, Password Reset')
    .addTag('projects', 'Projects - Create, Review, Verify, Fund')
    .addTag('upload', 'File Upload - Images & Documents')
    .addServer('http://localhost:3001', 'Local Development')
    .addServer('https://rootrise.onrender.com', 'Production Server')
    .addServer('/', 'Current Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'RootRise API Docs',
    customfavIcon: 'https://your-logo-url.com/favicon.ico', // Replace with your logo URL
    customCss: `
      .topbar-wrapper img { content: url('https://your-logo-url.com/logo.png'); width: 150px; height: auto; }
      .swagger-ui .topbar { background-color: #16a34a; }
      .swagger-ui .info .title { color: #16a34a; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  // Health check endpoint (before global prefix)
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: configService.get<string>('NODE_ENV') || 'development',
      version: '1.0.0',
      service: 'RootRise Backend',
      cors: {
        enabled: true,
        allowedOrigins: allowedOrigins.length,
        production: isProduction,
      }
    });
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 RootRise Backend running on port ${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api`);
  logger.log(`❤️  Health Check: http://localhost:${port}/health`);
  logger.log(`🌍 Environment: ${configService.get<string>('NODE_ENV') || 'development'}`);
  logger.log(`🔒 CORS: ${isProduction ? 'Production Mode' : 'Development Mode (All Origins)'}`);
}

bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});