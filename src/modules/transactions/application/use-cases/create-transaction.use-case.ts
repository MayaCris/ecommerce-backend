import { Inject, Injectable } from '@nestjs/common';
import { TransactionDomain } from '../../domain/entities/transaction-domain.entity';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';
import { TRANSACTION_REPOSITORY_TOKEN } from '../../transactions.tokens';
import { Money } from '../../../../shared/domain/value-objects/monetary/money.value-object';
import { TransactionStatus } from '../../../../shared/domain/enums/transaction-status.enum';
import { CardType } from '../../../../shared/domain/enums/card-type.enum';

/**
 * Create Transaction Use Case
 * Handles the business logic for creating new transactions
 */
@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY_TOKEN)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  /**
   * Execute the use case to create a new transaction
   */
  async execute(input: CreateTransactionInput): Promise<TransactionDomain> {
    // Create Money value objects for all amounts
    const subtotal = new Money(input.subtotal, input.currency || 'USD');
    const baseFee = new Money(input.baseFee || 0, input.currency || 'USD');
    const deliveryFee = new Money(
      input.deliveryFee || 0,
      input.currency || 'USD',
    );
    const totalAmount = new Money(input.totalAmount, input.currency || 'USD');

    // Create transaction domain entity
    const transaction = TransactionDomain.create({
      id: 'temp-id', // Temporary ID - will be replaced by UUID from database
      transactionNumber: this.generateTransactionNumber(),
      customerId: input.customerId,
      deliveryAddressId: input.deliveryAddressId,
      subtotal,
      baseFee,
      deliveryFee,
      totalAmount,
      status: input.status || TransactionStatus.PENDING,
      apiTransactionId: input.apiTransactionId || null,
      apiReference: input.apiReference || this.generateReference(),
      cardType: input.cardType || null,
      cardLastFourDigits: input.cardLastFourDigits || null,
      processedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Save and return
    return await this.transactionRepository.save(transaction);
  }

  /**
   * Generate a unique transaction ID
   */
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate a unique transaction number
   */
  private generateTransactionNumber(): string {
    return `TXN${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }

  /**
   * Generate a unique reference
   */
  private generateReference(): string {
    return `REF_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }
}

/**
 * Input DTO for creating transactions
 */
export interface CreateTransactionInput {
  customerId: string;
  deliveryAddressId: string;
  subtotal: number;
  baseFee?: number;
  deliveryFee?: number;
  totalAmount: number;
  currency?: string;
  status?: TransactionStatus;
  apiTransactionId?: string;
  apiReference?: string;
  cardType?: CardType;
  cardLastFourDigits?: string;
}
