import { Money, SKU, Quantity } from '../../../../shared/domain/value-objects';

/**
 * Product Domain Entity (Pure Domain - No Infrastructure Dependencies)
 * Represents a product in the business domain with Value Objects
 */
export class ProductDomain {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly price: Money,
    public readonly stock: Quantity,
    public readonly sku: SKU,
    public readonly imageUrl: string | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    this.validateInvariants();
  }

  /**
   * Creates a new product instance
   */
  public static create(params: {
    id: string;
    name: string;
    description?: string | null;
    price: Money;
    stock: Quantity;
    sku: SKU;
    imageUrl?: string | null;
    isActive?: boolean;
  }): ProductDomain {
    return new ProductDomain(
      params.id,
      params.name,
      params.description || null,
      params.price,
      params.stock,
      params.sku,
      params.imageUrl || null,
      params.isActive ?? true,
      new Date(),
      new Date(),
    );
  }

  /**
   * Updates the product stock
   */
  public updateStock(newStock: Quantity): ProductDomain {
    return new ProductDomain(
      this.id,
      this.name,
      this.description,
      this.price,
      newStock,
      this.sku,
      this.imageUrl,
      this.isActive,
      this.createdAt,
      new Date(), // Update timestamp
    );
  }

  /**
   * Reduces stock by specified quantity
   */
  public reduceStock(quantity: Quantity): ProductDomain {
    const newStock = this.stock.subtract(quantity);
    return this.updateStock(newStock);
  }

  /**
   * Increases stock by specified quantity
   */
  public increaseStock(quantity: Quantity): ProductDomain {
    const newStock = this.stock.add(quantity);
    return this.updateStock(newStock);
  }

  /**
   * Changes the product price
   */
  public changePrice(newPrice: Money): ProductDomain {
    return new ProductDomain(
      this.id,
      this.name,
      this.description,
      newPrice,
      this.stock,
      this.sku,
      this.imageUrl,
      this.isActive,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Activates or deactivates the product
   */
  public setActiveStatus(isActive: boolean): ProductDomain {
    return new ProductDomain(
      this.id,
      this.name,
      this.description,
      this.price,
      this.stock,
      this.sku,
      this.imageUrl,
      isActive,
      this.createdAt,
      new Date(),
    );
  }

  /**
   * Checks if product has sufficient stock
   */
  public hasStock(requiredQuantity: Quantity): boolean {
    return this.stock.isSufficient(requiredQuantity);
  }

  /**
   * Checks if product is available for purchase
   */
  public isAvailableForPurchase(): boolean {
    return this.isActive && this.stock.amount > 0;
  }

  /**
   * Gets stock level status
   */
  public getStockLevel(): 'out_of_stock' | 'low_stock' | 'in_stock' {
    if (this.stock.amount === 0) {
      return 'out_of_stock';
    }
    if (this.stock.amount <= 10) {
      return 'low_stock';
    }
    return 'in_stock';
  }

  /**
   * Validates business invariants
   */
  private validateInvariants(): void {
    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Product name cannot be empty');
    }

    if (this.name.length > 255) {
      throw new Error('Product name cannot exceed 255 characters');
    }

    // Value Objects already validate themselves
    // Additional business rules can be added here
  }

  /**
   * Returns a plain object representation
   */
  public toPlainObject(): {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    stock: number;
    sku: string;
    imageUrl: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price.amount,
      currency: this.price.currency,
      stock: this.stock.amount,
      sku: this.sku.code,
      imageUrl: this.imageUrl,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
