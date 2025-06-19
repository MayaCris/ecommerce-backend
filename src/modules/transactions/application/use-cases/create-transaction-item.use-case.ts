import { Inject, Injectable } from '@nestjs/common';
import { TransactionItemDomain } from '../../domain/entities/transaction-item-domain.entity';
import { ITransactionItemRepository } from '../../domain/repositories/transaction-item.repository.interface';
import { TRANSACTION_ITEM_REPOSITORY_TOKEN } from '../../transactions.tokens';

/**
 * Create Transaction Item Use Case
 * Handles the business logic for creating new transaction items
 */
@Injectable()
export class CreateTransactionItemUseCase {
  constructor(
    @Inject(TRANSACTION_ITEM_REPOSITORY_TOKEN)
    private readonly transactionItemRepository: ITransactionItemRepository,
  ) {}

  /**
   * Execute the use case to create a new transaction item
   */
  async execute(
    input: CreateTransactionItemInput,
  ): Promise<TransactionItemDomain> {
    // Validate input
    this.validateInput(input);

    // Create transaction item domain entity
    const transactionItem = TransactionItemDomain.create({
      id: 'temp-id', // Temporary ID - will be replaced by UUID from database
      transactionId: input.transactionId,
      productId: input.productId,
      quantity: input.quantity,
      unitPrice: input.unitPrice,
      totalPrice: input.totalPrice,
      currency: input.currency || 'USD',
    });

    // Save to repository
    return await this.transactionItemRepository.create(transactionItem);
  }

  /**
   * Validate input data
   */
  private validateInput(input: CreateTransactionItemInput): void {
    if (!input.transactionId || input.transactionId.trim().length === 0) {
      throw new Error('Transaction ID is required');
    }

    if (!input.productId || input.productId.trim().length === 0) {
      throw new Error('Product ID is required');
    }

    if (!input.quantity || input.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }

    if (!input.unitPrice || input.unitPrice < 0) {
      throw new Error('Unit price must be greater than or equal to 0');
    }

    if (!input.totalPrice || input.totalPrice < 0) {
      throw new Error('Total price must be greater than or equal to 0');
    }

    // Validate that total price matches quantity * unit price (with small tolerance for rounding)
    const calculatedTotal = input.quantity * input.unitPrice;
    if (Math.abs(calculatedTotal - input.totalPrice) > 0.01) {
      throw new Error(
        `Total price ${input.totalPrice} does not match calculated total ${calculatedTotal}`,
      );
    }
  }
}

/**
 * Input DTO for creating transaction items
 */
export interface CreateTransactionItemInput {
  transactionId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency?: string;
}
