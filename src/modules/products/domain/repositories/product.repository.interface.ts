import { ProductDomain } from '../entities/product-domain.entity';
import { IBaseRepository } from '../../../../shared/domain/repositories/base.repository.interface';
import { SKU, Money, Quantity } from '../../../../shared/domain/value-objects';

/**
 * Product repository interface
 * Defines all operations available for Product entities using Value Objects
 */
export interface IProductRepository extends IBaseRepository<ProductDomain> {
  /**
   * Find products by name (case-insensitive search)
   */
  findByName(name: string): Promise<ProductDomain[]>;

  /**
   * Find products by SKU
   */
  findBySku(sku: SKU): Promise<ProductDomain | null>;

  /**
   * Find all active products (is_active = true)
   */
  findActive(): Promise<ProductDomain[]>;

  /**
   * Find products with stock greater than specified amount
   */
  findWithStock(minStock?: Quantity): Promise<ProductDomain[]>;

  /**
   * Find products within price range
   */
  findByPriceRange(minPrice: Money, maxPrice: Money): Promise<ProductDomain[]>;

  /**
   * Search products by text (name or description)
   */
  search(
    query: string,
    options?: ProductSearchOptions,
  ): Promise<ProductDomain[]>;

  /**
   * Update stock quantity for a product
   */
  updateStock(id: string, newQuantity: Quantity): Promise<ProductDomain | null>;

  /**
   * Reduce stock quantity (for sales)
   */
  reduceStock(id: string, quantity: Quantity): Promise<ProductDomain | null>;

  /**
   * Check if product has sufficient stock
   */
  hasStock(id: string, requiredQuantity: Quantity): Promise<boolean>;
}

/**
 * Options for product search operations
 */
export interface ProductSearchOptions {
  includeInactive?: boolean;
  minStock?: number;
  sortBy?: 'name' | 'price' | 'stock' | 'created_at';
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}
