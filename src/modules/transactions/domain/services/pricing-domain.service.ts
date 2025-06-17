import { Injectable } from '@nestjs/common';
import { BaseDomainService } from '../../../../shared/domain/services/base-domain.service';

/**
 * Pricing Domain Service
 *
 * Handles all pricing calculations, discounts, and fees.
 * Centralizes pricing logic to ensure consistency across the application.
 */
@Injectable()
export class PricingDomainService extends BaseDomainService {
  private readonly BASE_FEE = 5000; // Base fee in cents (50 pesos)
  private readonly DELIVERY_FEE = 8000; // Delivery fee in cents (80 pesos)
  private readonly TAX_RATE = 0.19; // 19% IVA in Colombia

  constructor() {
    super('PricingDomainService');
  }

  /**
   * Calculates base fee for transactions
   * Business rule: Minimum base fee applies to all transactions
   */
  calculateBaseFee(): number {
    this.logDomainOperation('calculateBaseFee', { baseFee: this.BASE_FEE });
    return this.BASE_FEE;
  }

  /**
   * Calculates delivery fee
   * Business rule: Standard delivery fee, can be waived for high-value orders
   */
  calculateDeliveryFee(
    orderTotal: number,
    freeDeliveryThreshold = 100000,
  ): number {
    this.logDomainOperation('calculateDeliveryFee', {
      orderTotal,
      freeDeliveryThreshold,
    });

    this.validateBusinessRule(
      orderTotal >= 0,
      'Order total cannot be negative',
    );

    // Free delivery for orders above threshold
    if (orderTotal >= freeDeliveryThreshold) {
      return 0;
    }

    return this.DELIVERY_FEE;
  }

  /**
   * Calculates tax amount
   * Business rule: Standard VAT rate applies to all products
   */
  calculateTax(subtotal: number): number {
    this.logDomainOperation('calculateTax', {
      subtotal,
      taxRate: this.TAX_RATE,
    });

    this.validateBusinessRule(subtotal >= 0, 'Subtotal cannot be negative');

    return Math.round(subtotal * this.TAX_RATE);
  }

  /**
   * Applies discount percentage
   * Business rule: Discount cannot exceed 100%
   */
  applyDiscount(amount: number, discountPercentage: number): number {
    this.logDomainOperation('applyDiscount', { amount, discountPercentage });

    this.validateBusinessRule(
      discountPercentage >= 0 && discountPercentage <= 100,
      'Discount percentage must be between 0 and 100',
    );

    this.validateBusinessRule(amount >= 0, 'Amount cannot be negative');

    const discountAmount = Math.round(amount * (discountPercentage / 100));
    return amount - discountAmount;
  }

  /**
   * Calculates complete order total with all fees and taxes
   */
  calculateOrderTotal(
    subtotal: number,
    options: {
      includeDelivery?: boolean;
      discountPercentage?: number;
      freeDeliveryThreshold?: number;
    } = {},
  ): {
    subtotal: number;
    discount: number;
    subtotalAfterDiscount: number;
    tax: number;
    baseFee: number;
    deliveryFee: number;
    total: number;
  } {
    this.logDomainOperation('calculateOrderTotal', { subtotal, options });

    this.validateBusinessRule(subtotal > 0, 'Subtotal must be greater than 0');

    // Apply discount if provided
    const discount = options.discountPercentage
      ? Math.round(subtotal * (options.discountPercentage / 100))
      : 0;

    const subtotalAfterDiscount = subtotal - discount;

    // Calculate tax on discounted amount
    const tax = this.calculateTax(subtotalAfterDiscount);

    // Calculate fees
    const baseFee = this.calculateBaseFee();
    const deliveryFee = options.includeDelivery
      ? this.calculateDeliveryFee(
          subtotalAfterDiscount,
          options.freeDeliveryThreshold,
        )
      : 0;

    const total = subtotalAfterDiscount + tax + baseFee + deliveryFee;

    return {
      subtotal,
      discount,
      subtotalAfterDiscount,
      tax,
      baseFee,
      deliveryFee,
      total,
    };
  }

  /**
   * Validates pricing data
   */
  validatePricing(pricingData: {
    subtotal?: number;
    baseFee?: number;
    deliveryFee?: number;
    totalAmount?: number;
  }): void {
    this.logDomainOperation('validatePricing', 'Validating pricing data');

    if (pricingData.subtotal !== undefined) {
      this.validateBusinessRule(
        pricingData.subtotal >= 0,
        'Subtotal cannot be negative',
      );
    }

    if (pricingData.baseFee !== undefined) {
      this.validateBusinessRule(
        pricingData.baseFee >= 0,
        'Base fee cannot be negative',
      );
    }

    if (pricingData.deliveryFee !== undefined) {
      this.validateBusinessRule(
        pricingData.deliveryFee >= 0,
        'Delivery fee cannot be negative',
      );
    }

    if (pricingData.totalAmount !== undefined) {
      this.validateBusinessRule(
        pricingData.totalAmount > 0,
        'Total amount must be greater than 0',
      );
    }
  }
}
