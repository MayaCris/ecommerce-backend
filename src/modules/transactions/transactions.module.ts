import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionEntity } from './infrastructure/persistence/entities/transaction.entity';
import { TransactionItemEntity } from './infrastructure/persistence/entities/transaction-item.entity';
import { TransactionRepository } from './infrastructure/persistence/repositories/transaction.repository';
import { TransactionItemRepository } from './infrastructure/persistence/repositories/transaction-item.repository';
import {
  TRANSACTION_REPOSITORY_TOKEN,
  TRANSACTION_ITEM_REPOSITORY_TOKEN,
} from './transactions.tokens';
import { GetTransactionsUseCase } from './application/use-cases/get-transactions.use-case';
import { CreateTransactionUseCase } from './application/use-cases/create-transaction.use-case';
import { GetAllTransactionsUseCase } from './application/use-cases/get-all-transactions.use-case';
import { GetAllTransactionItemsUseCase } from './application/use-cases/get-all-transaction-items.use-case';
import { CreateTransactionItemUseCase } from './application/use-cases/create-transaction-item.use-case';
import { TransactionsController } from './presentation/controllers/transactions.controller';
import { TransactionItemsController } from './presentation/controllers/transaction-items.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, TransactionItemEntity]),
  ],
  controllers: [TransactionsController, TransactionItemsController],
  providers: [
    // Repository implementations with interface tokens
    {
      provide: TRANSACTION_REPOSITORY_TOKEN,
      useClass: TransactionRepository,
    },
    {
      provide: TRANSACTION_ITEM_REPOSITORY_TOKEN,
      useClass: TransactionItemRepository,
    },
    // Use cases
    GetTransactionsUseCase,
    CreateTransactionUseCase,
    GetAllTransactionsUseCase,
    GetAllTransactionItemsUseCase,
    CreateTransactionItemUseCase,
  ],
  exports: [TRANSACTION_REPOSITORY_TOKEN, TRANSACTION_ITEM_REPOSITORY_TOKEN],
})
export class TransactionsModule {}
