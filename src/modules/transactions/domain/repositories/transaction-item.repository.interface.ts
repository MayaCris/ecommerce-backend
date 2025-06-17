import { TransactionItem } from '../entities/transaction-item.entity';
import { IBaseRepository } from '../../../../shared/domain/repositories/base.repository.interface';

/**
 * Transaction Item repository interface
 * Defines all operations available for TransactionItem entities
 */
export interface ITransactionItemRepository
  extends IBaseRepository<TransactionItem> {
  /**
   * Find all items for a specific transaction
   */
  findByTransactionId(transactionId: string): Promise<TransactionItem[]>;

  /**
   * Find all transactions that include a specific product
   */
  findByProductId(productId: string): Promise<TransactionItem[]>;

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
