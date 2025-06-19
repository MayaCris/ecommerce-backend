import { TransactionItemDomain } from '../entities/transaction-item-domain.entity';
import { IBaseRepository } from '../../../../shared/domain/repositories/base.repository.interface';

/**
 * Transaction Item repository interface
 * Defines all operations available for TransactionItemDomain entities
 */
export interface ITransactionItemRepository
  extends IBaseRepository<TransactionItemDomain> {
  /**
   * Find all items for a specific transaction
   */
  findByTransactionId(transactionId: string): Promise<TransactionItemDomain[]>;

  /**
   * Find all transactions that include a specific product
   */
  findByProductId(productId: string): Promise<TransactionItemDomain[]>;

  /**
   * Count items by transaction ID
   */
  countByTransactionId(transactionId: string): Promise<number>;

  /**
   * Delete all items for a transaction
   */
  deleteByTransactionId(transactionId: string): Promise<boolean>;

  /**
   * Calculate total quantity sold for a product
   */
  getTotalQuantitySold(
    productId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number>;

  /**
   * Find best selling products
   */
  findBestSellingProducts(
    limit: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ProductSalesData[]>;

  /**
   * Calculate total items value for a transaction
   */
  calculateTransactionTotal(transactionId: string): Promise<number>;
}

/**
 * Product sales data interface
 */
export interface ProductSalesData {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}
