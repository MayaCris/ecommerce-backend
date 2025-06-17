import { Product } from '../entities/product.entity';
import { IBaseRepository } from '../../../../shared/domain/repositories/base.repository.interface';

/**
 * Product repository interface
 * Defines all operations available for Product entities
 */
export interface IProductRepository extends IBaseRepository<Product> {
  /**
   * Find products by name (case-insensitive search)
   */
  findByName(name: string): Promise<Product[]>;

  /**
   * Find products by SKU
   */
  findBySku(sku: string): Promise<Product | null>;

  /**
   * Find all active products (is_active = true)
   */
  findActive(): Promise<Product[]>;

  /**
   * Find products with stock greater than specified amount
   */
  findWithStock(minStock?: number): Promise<Product[]>;

  /**
   * Find products within price range
   */
  findByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]>;

  /**
   * Search products by text (name or description)
   */
  search(query: string, options?: ProductSearchOptions): Promise<Product[]>;

  /**
   * Update stock quantity for a product
   */
  updateStock(id: string, newQuantity: number): Promise<Product | null>;

  /**
   * Reduce stock quantity (for sales)
   */
  reduceStock(id: string, quantity: number): Promise<Product | null>;

  /**
   * Check if product has sufficient stock
   */
  hasStock(id: string, requiredQuantity: number): Promise<boolean>;
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
