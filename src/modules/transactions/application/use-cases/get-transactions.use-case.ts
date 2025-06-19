import { Inject, Injectable } from '@nestjs/common';
import { TransactionDomain } from '../../domain/entities/transaction-domain.entity';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { TRANSACTION_REPOSITORY_TOKEN } from '../../transactions.tokens';

/**
 * Get Transactions Use Case
 * Handles the business logic for retrieving transactions
 */
@Injectable()
export class GetTransactionsUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY_TOKEN)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  /**
   * Execute the use case to get all transactions
   */
  async execute(limit?: number, offset?: number): Promise<TransactionDomain[]> {
    return await this.transactionRepository.findAll({
      limit,
      offset,
    });
  }

  /**
   * Get transactions by customer ID
   */
  async getByCustomerId(customerId: string): Promise<TransactionDomain[]> {
    return await this.transactionRepository.findByCustomerId(customerId);
  }

  /**
   * Get transaction by ID
   */
  async getById(id: string): Promise<TransactionDomain | null> {
    return await this.transactionRepository.findById(id);
  }
}
