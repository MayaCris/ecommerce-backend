import { Inject, Injectable } from '@nestjs/common';
import { TransactionItemDomain } from '../../domain/entities/transaction-item-domain.entity';
import { ITransactionItemRepository } from '../../domain/repositories/transaction-item.repository.interface';
import { TRANSACTION_ITEM_REPOSITORY_TOKEN } from '../../transactions.tokens';

/**
 * Get All Transaction Items Use Case
 * Handles the business logic for retrieving all transaction items
 */
@Injectable()
export class GetAllTransactionItemsUseCase {
  constructor(
    @Inject(TRANSACTION_ITEM_REPOSITORY_TOKEN)
    private readonly transactionItemRepository: ITransactionItemRepository,
  ) {}

  /**
   * Execute the use case to get all transaction items
   */
  async execute(): Promise<TransactionItemDomain[]> {
    return await this.transactionItemRepository.findAll();
  }

  /**
   * Execute the use case to get all transaction items by transaction ID
   */
  async executeByTransactionId(
    transactionId: string,
  ): Promise<TransactionItemDomain[]> {
    if (!transactionId || transactionId.trim().length === 0) {
      throw new Error('Transaction ID is required');
    }

    return await this.transactionItemRepository.findByTransactionId(
      transactionId,
    );
  }

  /**
   * Execute the use case to get all transaction items by product ID
   */
  async executeByProductId(
    productId: string,
  ): Promise<TransactionItemDomain[]> {
    if (!productId || productId.trim().length === 0) {
      throw new Error('Product ID is required');
    }

    return await this.transactionItemRepository.findByProductId(productId);
  }
}
