import { Money, Quantity } from '../../../../shared/domain/value-objects';

/**
 * Transaction Item Domain Entity
 * Pure domain entity using Value Objects - contains business logic
 */
export class TransactionItemDomain {
  private constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public readonly productId: string,
    public readonly quantity: Quantity,
    public readonly unitPrice: Money,
    public readonly totalPrice: Money,
    public readonly createdAt: Date,
  ) {}

  /**
   * Factory method to create a new Transaction Item
   */
  static create(data: {
    id: string;
    transactionId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    currency?: string;
    createdAt?: Date;
  }): TransactionItemDomain {
    const quantity = new Quantity(data.quantity);
    const unitPrice = new Money(data.unitPrice, data.currency);
    const totalPrice = new Money(data.totalPrice, data.currency);

    // Validate that total price matches quantity * unit price
    const calculatedTotal = quantity.amount * unitPrice.amount;
    if (Math.abs(calculatedTotal - totalPrice.amount) > 0.01) {
      throw new Error(
        `Total price ${totalPrice.amount} does not match calculated total ${calculatedTotal}`,
      );
    }

    return new TransactionItemDomain(
      data.id,
      data.transactionId,
      data.productId,
      quantity,
      unitPrice,
      totalPrice,
      data.createdAt || new Date(),
    );
  }

  /**
   * Calculate the total amount for this item
   */
  getCalculatedTotal(): Money {
    const total = this.quantity.amount * this.unitPrice.amount;
    return new Money(total, this.unitPrice.currency);
  }

  /**
   * Check if the stored total price is correct
   */
  isValidTotalPrice(): boolean {
    const calculatedTotal = this.getCalculatedTotal();
    return Math.abs(calculatedTotal.amount - this.totalPrice.amount) <= 0.01;
  }

  /**
   * Get the total value as a formatted string
   */
  getFormattedTotal(): string {
    return this.totalPrice.format();
  }

  /**
   * Get the unit price as a formatted string
   */
  getFormattedUnitPrice(): string {
    return this.unitPrice.format();
  }

  /**
   * Check if this item represents a valid quantity
   */
  hasValidQuantity(): boolean {
    return this.quantity.amount > 0;
  }

  /**
   * Get item description for display
   */
  getItemDescription(): string {
    return `${this.quantity.amount} x ${this.getFormattedUnitPrice()} = ${this.getFormattedTotal()}`;
  }
}
