import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  // CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // API prefix
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('E-commerce Payment API')
    .setDescription(
      `
      ## E-commerce API with API Payment Integration
      
      This API provides a complete e-commerce solution with integrated payment processing through API.
      
      ### Business Flow
      1. **Product Catalog** - Browse available products with real-time stock
      2. **Customer Management** - Handle customer data and delivery addresses  
      3. **Transaction Processing** - Create and manage payment transactions
      4. **Payment Integration** - Process payments through API
      5. **Delivery Tracking** - Manage order deliveries and status updates
      
      ### Key Features
      - 🛍️ Product catalog with stock management
      - 💳 Secure payment processing with API
      - 📦 Order and delivery tracking
      - 🎯 Real-time stock updates
      - 🔐 Credit card validation (Visa/Mastercard detection)
      - 📱 Mobile-first responsive design support
      
      ### Payment Flow
      1. Customer selects products → 2. Payment form → 3. Payment summary → 4. API processing → 5. Result confirmation
      
      ### Environment
      - **Sandbox Mode**: All payments are processed in API's sandbox environment
      - **Test Data**: Use test credit card numbers for development
      `,
    )
    .setVersion('1.0.0')
    .setContact(
      'E-commerce Backend Team',
      'https://github.com/MayaCris/ecommerce-backend',
      'cristianmgallegodev@gmail.com',
    )
    .setLicense('Private', '')
    .addServer('http://localhost:3000', 'Development Server')
    .addBearerAuth(
      {
        description: 'Please enter token in following format: Bearer <JWT>',
        name: 'Authorization',
        bearerFormat: 'Bearer',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'access-token',
    )
    .addTag('Products', 'Product catalog and inventory management')
    .addTag('Customers', 'Customer management and profiles')
    .addTag('Transactions', 'Payment transactions and order processing')
    .addTag('Payments', 'API payment integration endpoints')
    .addTag('Deliveries', 'Order delivery and tracking')
    .addTag('Health', 'Application health and status checks')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Swagger UI options
  const swaggerOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'E-commerce API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { 
        background-color: #2c3e50; 
      }
      .swagger-ui .topbar .download-url-wrapper .select-label {
        color: white;
      }
    `,
  };

  SwaggerModule.setup('docs', app, document, swaggerOptions);

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);

  console.log(
    `🚀 Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  console.log(`📖 Swagger documentation: http://localhost:${port}/docs`);
}

void bootstrap();
