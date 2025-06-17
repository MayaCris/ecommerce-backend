import { Delivery } from '../entities/delivery.entity';
import { DeliveryStatus } from '../../../../shared/domain/enums';
import { IBaseRepository } from '../../../../shared/domain/repositories/base.repository.interface';

/**
 * Delivery repository interface
 * Defines all operations available for Delivery entities
 */
export interface IDeliveryRepository extends IBaseRepository<Delivery> {
  /**
   * Find delivery by transaction ID
   */
  findByTransactionId(transactionId: string): Promise<Delivery | null>;

  /**
   * Find deliveries by status
   */
  findByStatus(status: DeliveryStatus): Promise<Delivery[]>;

  /**
   * Find deliveries by address
   */
  findByAddress(address: string): Promise<Delivery[]>;

  /**
   * Find deliveries scheduled for today
   */
  findScheduledForToday(): Promise<Delivery[]>;

  /**
   * Find overdue deliveries
   */
  findOverdue(): Promise<Delivery[]>;

  /**
   * Update delivery status
   */
  updateStatus(id: string, status: DeliveryStatus): Promise<Delivery | null>;

  /**
   * Find deliveries by date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Delivery[]>;

  /**
   * Get delivery statistics
   */
  getDeliveryStatistics(
    startDate: Date,
    endDate: Date,
  ): Promise<DeliveryStatistics>;
}

/**
 * Delivery statistics interface
 */
export interface DeliveryStatistics {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  returned: number;
  averageDeliveryTime: number; // in hours
}
