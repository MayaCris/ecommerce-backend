import { Inject, Injectable } from '@nestjs/common';
import { TransactionDomain } from '../../domain/entities/transaction-domain.entity';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { TRANSACTION_REPOSITORY_TOKEN } from '../../transactions.tokens';

/**
 * Get All Transactions Use Case
 * Simple use case for retrieving all transactions (mainly for testing)
 */
@Injectable()
export class GetAllTransactionsUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY_TOKEN)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  /**
   * Get all transactions
   */
  async execute(): Promise<TransactionDomain[]> {
    return await this.transactionRepository.findAll();
  }

  /**
   * Get all transactions with pagination
   */
  async executeWithPagination(
    limit?: number,
    offset?: number,
  ): Promise<TransactionDomain[]> {
    return await this.transactionRepository.findAll({
      limit,
      offset,
    });
  }

  /**
   * Count total transactions
   */
  async count(): Promise<number> {
    return await this.transactionRepository.count();
  }
}
