import { TransactionStatus } from '../../../../shared/domain/enums';
import { IBaseRepository } from '../../../../shared/domain/repositories/base.repository.interface';
import { TransactionDomain } from '../entities/transaction-domain.entity';

/**
 * Transaction repository interface
 * Defines all operations available for Transaction entities
 */
export interface ITransactionRepository
  extends IBaseRepository<TransactionDomain> {
  /**
   * Save a transaction
   */
  //save(transaction: TransactionDomain): TransactionDomain | PromiseLike<TransactionDomain>;
  save(transaction: TransactionDomain): Promise<TransactionDomain>;
  /**
   * Find transactions by customer ID
   */
  findByCustomerId(customerId: string): Promise<TransactionDomain[]>;

  /**
   * Find transaction by ID
   */
  findById(id: string): Promise<TransactionDomain | null>;

  /**
   * Find transaction by API transaction ID
   */
  findByApiId(apiTransactionId: string): Promise<TransactionDomain | null>;

  /**
   * Find transactions by status
   */
  findByStatus(status: TransactionStatus): Promise<TransactionDomain[]>;

  /**
   * Find transactions within date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<TransactionDomain[]>;

  /**
   * Find transactions by amount range
   */
  findByAmountRange(
    minAmount: number,
    maxAmount: number,
  ): Promise<TransactionDomain[]>;

  /**
   * Update transaction status
   */
  updateStatus(
    id: string,
    status: TransactionStatus,
  ): Promise<TransactionDomain | null>;

  /**
   * Find pending transactions older than specified minutes
   */
  findStaleTransactions(minutesAgo: number): Promise<TransactionDomain[]>;

  /**
   * Calculate total revenue for date range
   */
  calculateRevenue(startDate: Date, endDate: Date): Promise<number>;

  /**
   * Get transaction statistics
   */
  getStatistics(startDate: Date, endDate: Date): Promise<TransactionStatistics>;
}

/**
 * Transaction statistics interface
 */
export interface TransactionStatistics {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  cancelled: number;
  totalRevenue: number;
  averageAmount: number;
}
