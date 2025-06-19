import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerEntity } from './infrastructure/persistence/entities/customer.entity';
import { CustomerRepository } from './infrastructure/persistence/repositories/customer.repository';
import { CUSTOMER_REPOSITORY_TOKEN } from './customers.tokens';
import { GetCustomersUseCase } from './application/use-cases/get-customers.use-case';
import { CreateCustomerUseCase } from './application/use-cases/create-customer.use-case';
import { CustomersController } from './presentation/controllers/customers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerEntity])],
  controllers: [CustomersController],
  providers: [
    // Repository implementation with interface token
    {
      provide: CUSTOMER_REPOSITORY_TOKEN,
      useClass: CustomerRepository,
    },
    // Use cases
    GetCustomersUseCase,
    CreateCustomerUseCase,
  ],
  exports: [CUSTOMER_REPOSITORY_TOKEN],
})
export class CustomersModule {}
