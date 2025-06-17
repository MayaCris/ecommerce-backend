import { Injectable } from '@nestjs/common';
import { BaseDomainService } from '../../../../shared/domain/services/base-domain.service';
import { Product } from '../entities/product.entity';

/**
 * Product Domain Service
 *
 * Encapsulates business logic related to products that doesn't belong
 * to the Product entity itself. Handles complex product operations,
 * validation rules, and business workflows.
 */
@Injectable()
export class ProductDomainService extends BaseDomainService {
  constructor() {
    super('ProductDomainService');
  }

  /**
   * Validates if a product can be purchased
   * Business rule: Product must be active and have sufficient stock
   */
  canPurchaseProduct(product: Product, requestedQuantity: number): boolean {
    this.logDomainOperation('canPurchaseProduct', {
      productId: product.id,
      requestedQuantity,
      currentStock: product.stockQuantity,
      isActive: product.isActive,
    });

    this.validateBusinessRule(
      product.isActive,
      'Cannot purchase inactive product',
    );

    this.validateBusinessRule(
      product.stockQuantity >= requestedQuantity,
      `Insufficient stock. Available: ${product.stockQuantity}, Requested: ${requestedQuantity}`,
    );

    return true;
  }

  /**
   * Calculates the total value of multiple product items
   */
  calculateProductsTotal(
    items: Array<{ product: Product; quantity: number }>,
  ): number {
    this.logDomainOperation('calculateProductsTotal', {
      itemsCount: items.length,
    });

    return items.reduce((total, item) => {
      this.canPurchaseProduct(item.product, item.quantity);
      return total + item.product.price * item.quantity;
    }, 0);
  }

  /**
   * Determines if a product is considered low stock
   * Business rule: Low stock threshold is 10 units
   */
  isLowStock(product: Product): boolean {
    const LOW_STOCK_THRESHOLD = 10;
    return product.stockQuantity <= LOW_STOCK_THRESHOLD;
  }

  /**
   * Validates product data before creation/update
   */
  validateProductData(productData: Partial<Product>): void {
    if (productData.price !== undefined) {
      this.validateBusinessRule(
        productData.price > 0,
        'Product price must be greater than 0',
      );
    }

    if (productData.stockQuantity !== undefined) {
      this.validateBusinessRule(
        productData.stockQuantity >= 0,
        'Product stock cannot be negative',
      );
    }

    if (productData.name !== undefined) {
      this.validateBusinessRule(
        productData.name.trim().length > 0,
        'Product name cannot be empty',
      );
    }
  }

  /**
   * Reserves stock for a product (decreases available quantity)
   * Business rule: Cannot reserve more than available stock
   */
  reserveStock(product: Product, quantity: number): Product {
    this.logDomainOperation('reserveStock', {
      productId: product.id,
      quantity,
      currentStock: product.stockQuantity,
    });

    this.canPurchaseProduct(product, quantity);

    product.stockQuantity -= quantity;
    return product;
  }

  /**
   * Releases reserved stock (increases available quantity)
   */
  releaseStock(product: Product, quantity: number): Product {
    this.logDomainOperation('releaseStock', {
      productId: product.id,
      quantity,
      currentStock: product.stockQuantity,
    });

    this.validateBusinessRule(
      quantity > 0,
      'Release quantity must be greater than 0',
    );

    product.stockQuantity += quantity;
    return product;
  }
}
