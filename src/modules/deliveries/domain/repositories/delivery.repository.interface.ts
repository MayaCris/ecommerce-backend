import { DeliveryDomain } from '../entities/delivery-domain.entity';
import { DeliveryStatus } from '../../../../shared/domain/enums';
import { IBaseRepository } from '../../../../shared/domain/repositories/base.repository.interface';

/**
 * Delivery repository interface
 * Defines all operations available for Delivery entities
 */
export interface IDeliveryRepository extends IBaseRepository<DeliveryDomain> {
  /**
   * Find delivery by transaction ID
   */
  findByTransactionId(transactionId: string): Promise<DeliveryDomain | null>;

  /**
   * Find deliveries by status
   */
  findByStatus(status: DeliveryStatus): Promise<DeliveryDomain[]>;

  /**
   * Find deliveries by address
   */
  findByAddress(address: string): Promise<DeliveryDomain[]>;

  /**
   * Find deliveries scheduled for today
   */
  findScheduledForToday(): Promise<DeliveryDomain[]>;

  /**
   * Find overdue deliveries
   */
  findOverdue(): Promise<DeliveryDomain[]>;

  /**
   * Update delivery status
   */
  updateStatus(
    id: string,
    status: DeliveryStatus,
  ): Promise<DeliveryDomain | null>;

  /**
   * Find deliveries by date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<DeliveryDomain[]>;

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
