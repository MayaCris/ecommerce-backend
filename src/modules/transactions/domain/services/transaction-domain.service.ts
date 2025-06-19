import { Injectable } from '@nestjs/common';
import { BaseDomainService } from '../../../../shared/domain/services/base-domain.service';
import { TransactionEntity } from '../../infrastructure/persistence/entities/transaction.entity';
import { TransactionItemDomain } from '../entities/transaction-item-domain.entity';
import { TransactionStatus } from '../../../../shared/domain/enums';
import { Product } from '../../../products/domain/entities/product.entity';

/**
 * Transaction Domain Service
 *
 * Handles complex business logic related to transactions, payments,
 * and order processing. Manages transaction state transitions and
 * business rules validation.
 */
@Injectable()
export class TransactionDomainService extends BaseDomainService {
  constructor() {
    super('TransactionDomainService');
  }

  /**
   * Calculates transaction totals including fees
   * Business rule: Base fee is applied, delivery fee is optional
   */
  calculateTransactionTotals(
    items: TransactionItemDomain[],
    baseFee = 0,
    deliveryFee = 0,
  ): {
    subtotal: number;
    baseFee: number;
    deliveryFee: number;
    totalAmount: number;
  } {
    this.logDomainOperation('calculateTransactionTotals', {
      itemsCount: items.length,
      baseFee,
      deliveryFee,
    });

    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice.amount * item.quantity.amount,
      0,
    );

    this.validateBusinessRule(
      subtotal > 0,
      'Transaction subtotal must be greater than 0',
    );

    const totalAmount = subtotal + baseFee + deliveryFee;

    return {
      subtotal,
      baseFee,
      deliveryFee,
      totalAmount,
    };
  }

  /**
   * Validates if a transaction can be processed
   * Business rule: Transaction must be in pending status and have valid items
   */
  canProcessTransaction(transaction: TransactionEntity): boolean {
    this.logDomainOperation('canProcessTransaction', {
      transactionId: transaction.id,
      status: transaction.status,
      totalAmount: transaction.totalAmount,
    });

    this.validateBusinessRule(
      transaction.status === TransactionStatus.PENDING,
      'Only pending transactions can be processed',
    );

    this.validateBusinessRule(
      parseFloat(transaction.totalAmount) > 0,
      'Transaction total amount must be greater than 0',
    );

    return true;
  }

  /**
   * Creates transaction items from product selections
   */
  createTransactionItems(
    products: Array<{ product: Product; quantity: number }>,
  ): Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }> {
    this.logDomainOperation('createTransactionItems', {
      productsCount: products.length,
    });

    return products.map(({ product, quantity }) => {
      this.validateBusinessRule(
        quantity > 0,
        'Item quantity must be greater than 0',
      );

      const totalPrice = product.price * quantity;

      return {
        productId: product.id,
        quantity,
        unitPrice: product.price,
        totalPrice,
      };
    });
  }

  /**
   * Validates transaction status transition
   * Business rule: Define allowed status transitions
   */
  canTransitionToStatus(
    currentStatus: TransactionStatus,
    newStatus: TransactionStatus,
  ): boolean {
    this.logDomainOperation('canTransitionToStatus', {
      currentStatus,
      newStatus,
    });

    const allowedTransitions: Record<TransactionStatus, TransactionStatus[]> = {
      [TransactionStatus.PENDING]: [
        TransactionStatus.APPROVED,
        TransactionStatus.DECLINED,
        TransactionStatus.ERROR,
        TransactionStatus.CANCELLED,
      ],
      [TransactionStatus.APPROVED]: [], // No transitions from approved
      [TransactionStatus.DECLINED]: [TransactionStatus.PENDING], // Can retry
      [TransactionStatus.ERROR]: [TransactionStatus.PENDING], // Can retry
      [TransactionStatus.CANCELLED]: [], // No transitions from cancelled
    };

    const isAllowed =
      allowedTransitions[currentStatus]?.includes(newStatus) || false;

    this.validateBusinessRule(
      isAllowed,
      `Invalid status transition from ${currentStatus} to ${newStatus}`,
    );

    return true;
  }

  /**
   * Applies transaction to update entity state
   */
  updateTransactionStatus(
    transaction: TransactionEntity,
    newStatus: TransactionStatus,
  ): TransactionEntity {
    this.logDomainOperation('updateTransactionStatus', {
      transactionId: transaction.id,
      oldStatus: transaction.status,
      newStatus,
    });

    this.canTransitionToStatus(transaction.status, newStatus);

    transaction.status = newStatus;
    transaction.updatedAt = new Date();

    return transaction;
  }

  /**
   * Validates payment information
   */
  validatePaymentData(paymentData: {
    cardNumber?: string;
    cvv?: string;
    expiryMonth?: number;
    expiryYear?: number;
  }): void {
    this.logDomainOperation(
      'validatePaymentData',
      'Payment validation started',
    );

    if (paymentData.cardNumber) {
      this.validateBusinessRule(
        paymentData.cardNumber.length >= 13,
        'Card number must be at least 13 digits',
      );
    }

    if (paymentData.cvv) {
      this.validateBusinessRule(
        paymentData.cvv.length >= 3,
        'CVV must be at least 3 digits',
      );
    }

    if (paymentData.expiryMonth) {
      this.validateBusinessRule(
        paymentData.expiryMonth >= 1 && paymentData.expiryMonth <= 12,
        'Expiry month must be between 1 and 12',
      );
    }

    if (paymentData.expiryYear) {
      const currentYear = new Date().getFullYear();
      this.validateBusinessRule(
        paymentData.expiryYear >= currentYear,
        'Card expiry year cannot be in the past',
      );
    }
  }
}
