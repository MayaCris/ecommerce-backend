import { Money } from '../../../../shared/domain/value-objects/monetary/money.value-object';
import { TransactionStatus } from '../../../../shared/domain/enums/transaction-status.enum';
import { CardType } from '../../../../shared/domain/enums/card-type.enum';

/**
 * Transaction Domain Entity
 * Pure domain entity using Value Objects - matches the real database structure
 */
export class TransactionDomain {
  private constructor(
    public readonly id: string,
    public readonly transactionNumber: string,
    public readonly customerId: string,
    public readonly deliveryAddressId: string,
    public readonly subtotal: Money,
    public readonly baseFee: Money,
    public readonly deliveryFee: Money,
    public readonly totalAmount: Money,
    public readonly status: TransactionStatus,
    public readonly apiTransactionId: string | null,
    public readonly apiReference: string | null,
    public readonly cardType: CardType | null,
    public readonly cardLastFourDigits: string | null,
    public readonly processedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Factory method to create a new Transaction
   */
  static create(data: {
    id: string;
    transactionNumber: string;
    customerId: string;
    deliveryAddressId: string;
    subtotal: Money;
    baseFee: Money;
    deliveryFee: Money;
    totalAmount: Money;
    status: TransactionStatus;
    apiTransactionId?: string | null;
    apiReference?: string | null;
    cardType?: CardType | null;
    cardLastFourDigits?: string | null;
    processedAt?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): TransactionDomain {
    return new TransactionDomain(
      data.id,
      data.transactionNumber,
      data.customerId,
      data.deliveryAddressId,
      data.subtotal,
      data.baseFee,
      data.deliveryFee,
      data.totalAmount,
      data.status,
      data.apiTransactionId || null,
      data.apiReference || null,
      data.cardType || null,
      data.cardLastFourDigits || null,
      data.processedAt || null,
      data.createdAt || new Date(),
      data.updatedAt || new Date(),
    );
  }

  /**
   * Check if transaction is successful
   */
  isSuccessful(): boolean {
    return this.status === TransactionStatus.APPROVED;
  }

  /**
   * Check if transaction is pending
   */
  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  /**
   * Check if transaction is final (cannot be changed)
   */
  isFinal(): boolean {
    return [
      TransactionStatus.APPROVED,
      TransactionStatus.DECLINED,
      TransactionStatus.CANCELLED,
      TransactionStatus.ERROR,
    ].includes(this.status);
  }

  /**
   * Get formatted total amount
   */
  getFormattedTotalAmount(): string {
    return this.totalAmount.format();
  }

  /**
   * Get formatted subtotal
   */
  getFormattedSubtotal(): string {
    return this.subtotal.format();
  }

  /**
   * Update transaction status
   */
  updateStatus(newStatus: TransactionStatus): TransactionDomain {
    if (this.isFinal() && newStatus !== this.status) {
      throw new Error('Cannot update status of a final transaction');
    }

    return TransactionDomain.create({
      id: this.id,
      transactionNumber: this.transactionNumber,
      customerId: this.customerId,
      deliveryAddressId: this.deliveryAddressId,
      subtotal: this.subtotal,
      baseFee: this.baseFee,
      deliveryFee: this.deliveryFee,
      totalAmount: this.totalAmount,
      status: newStatus,
      apiTransactionId: this.apiTransactionId,
      apiReference: this.apiReference,
      cardType: this.cardType,
      cardLastFourDigits: this.cardLastFourDigits,
      processedAt: this.processedAt,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Mark transaction as processed
   */
  markAsProcessed(): TransactionDomain {
    return TransactionDomain.create({
      id: this.id,
      transactionNumber: this.transactionNumber,
      customerId: this.customerId,
      deliveryAddressId: this.deliveryAddressId,
      subtotal: this.subtotal,
      baseFee: this.baseFee,
      deliveryFee: this.deliveryFee,
      totalAmount: this.totalAmount,
      status: this.status,
      apiTransactionId: this.apiTransactionId,
      apiReference: this.apiReference,
      cardType: this.cardType,
      cardLastFourDigits: this.cardLastFourDigits,
      processedAt: new Date(),
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  /**
   * Validate transaction data
   */
  isValid(): boolean {
    return (
      this.id.trim().length > 0 &&
      this.transactionNumber.trim().length > 0 &&
      this.customerId.trim().length > 0 &&
      this.deliveryAddressId.trim().length > 0 &&
      this.subtotal.amount > 0 &&
      this.totalAmount.amount > 0 &&
      Object.values(TransactionStatus).includes(this.status)
    );
  }
}
