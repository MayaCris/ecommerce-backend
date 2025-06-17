import { Transaction } from '../entities/transaction.entity';
import { TransactionStatus } from '../../../../shared/domain/enums';
import { IBaseRepository } from '../../../../shared/domain/repositories/base.repository.interface';

/**
 * Transaction repository interface
 * Defines all operations available for Transaction entities
 */
export interface ITransactionRepository extends IBaseRepository<Transaction> {
  /**
   * Find transactions by customer ID
   */
  findByCustomerId(customerId: string): Promise<Transaction[]>;

  /**
   * Find transaction by API transaction ID
   */
  findByApiId(apiTransactionId: string): Promise<Transaction | null>;

  /**
   * Find transactions by status
   */
  findByStatus(status: TransactionStatus): Promise<Transaction[]>;

  /**
   * Find transactions within date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;

  /**
   * Find transactions by amount range
   */
  findByAmountRange(
    minAmount: number,
    maxAmount: number,
  ): Promise<Transaction[]>;

  /**
   * Update transaction status
   */
  updateStatus(
    id: string,
    status: TransactionStatus,
  ): Promise<Transaction | null>;

  /**
   * Find pending transactions older than specified minutes
   */
  findStaleTransactions(minutesAgo: number): Promise<Transaction[]>;

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
