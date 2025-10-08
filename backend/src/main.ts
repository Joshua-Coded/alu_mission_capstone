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

  // CORS configuration - Fixed to handle undefined values
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const renderUrl = configService.get<string>('RENDER_EXTERNAL_URL');
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:5173',
    'https://localhost:3000',
  ];

  // Add frontend URL if it exists
  if (frontendUrl) {
    allowedOrigins.push(frontendUrl);
  }

  // Add render URL if in production and it exists
  if (isProduction && renderUrl) {
    allowedOrigins.push(renderUrl);
  }
  
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('API_TITLE') || 'RootRise API')
    .setDescription(configService.get<string>('API_DESCRIPTION') || 'RootRise Authentication API')
    .setVersion(configService.get<string>('API_VERSION') || '1.0')
    .addBearerAuth()
    .addServer('/', 'Production Server')
    .addServer('http://localhost:3001', 'Local Development')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

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