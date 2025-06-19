import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';

// Domain
import { PaymentRepository } from './domain/repositories/payment.repository';
import { externalApiService } from './domain/services/external-api.service';

// Application
import { CreateCardTokenUseCase } from './application/use-cases/create-card-token.use-case';
import { ProcessPaymentUseCase } from './application/use-cases/process-payment.use-case';
import { GetPaymentStatusUseCase } from './application/use-cases/get-payment-status.use-case';

// Infrastructure
import { PaymentEntity } from './infrastructure/persistence/entities/payment.entity';
import { PaymentRepositoryImpl } from './infrastructure/persistence/payment.repository.impl';
import { externalApiAdapter } from './infrastructure/adapters/external-api.adapter';

// Presentation
import { PaymentsController } from './presentation/controllers/payments.controller';

// Tokens
import { PAYMENT_TOKENS } from './payments.tokens';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([PaymentEntity]),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  controllers: [PaymentsController],
  providers: [
    // Use Cases
    CreateCardTokenUseCase,
    ProcessPaymentUseCase,
    GetPaymentStatusUseCase,
    
    // Implementations
    {
      provide: PAYMENT_TOKENS.EXTERNAL_API_SERVICE,
      useClass: externalApiAdapter,
    },
    {
      provide: PAYMENT_TOKENS.PAYMENT_REPOSITORY,
      useClass: PaymentRepositoryImpl,
    },
  ],
  exports: [
    // Export tokens for other modules to use
    PAYMENT_TOKENS.PAYMENT_REPOSITORY,
    PAYMENT_TOKENS.EXTERNAL_API_SERVICE,
  ],
})
export class PaymentsModule {}
