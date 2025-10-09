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

  // CORS configuration
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const renderUrl = configService.get<string>('RENDER_EXTERNAL_URL');
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'https://localhost:3000',
  ];

  if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
  }

  if (isProduction && renderUrl) {
    allowedOrigins.push(renderUrl);
  }
  
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

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
- Production: Your production URL

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
    .addServer('/', 'Production Server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'RootRise API Docs',
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  // Health check endpoint
  app.getHttpAdapter().get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: configService.get<string>('NODE_ENV') || 'development',
      version: '1.0.0',
      service: 'RootRise Backend'
    });
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api/v1');

  const port = configService.get<number>('PORT') || 3001;
  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 RootRise Backend running on port ${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api`);
  logger.log(`❤️ Health Check: http://localhost:${port}/health`);
  logger.log(`🌍 Environment: ${configService.get<string>('NODE_ENV') || 'development'}`);
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});