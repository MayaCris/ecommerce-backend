import { Injectable } from '@nestjs/common';
import { BaseDomainService } from '../../../../shared/domain/services/base-domain.service';
import { DeliveryDomain } from '../entities/delivery-domain.entity';
import { DeliveryStatus } from '../../../../shared/domain/enums';

/**
 * Delivery Domain Service
 *
 * Manages delivery business logic, status transitions, and tracking.
 * Handles delivery lifecycle and validation rules.
 */
@Injectable()
export class DeliveryDomainService extends BaseDomainService {
  constructor() {
    super('DeliveryDomainService');
  }

  /**
   * Validates if delivery status can be updated
   * Business rule: Define allowed delivery status transitions
   */
  canTransitionToStatus(
    currentStatus: DeliveryStatus,
    newStatus: DeliveryStatus,
  ): boolean {
    this.logDomainOperation('canTransitionToStatus', {
      currentStatus,
      newStatus,
    });

    const allowedTransitions: Record<DeliveryStatus, DeliveryStatus[]> = {
      [DeliveryStatus.PENDING]: [
        DeliveryStatus.PROCESSING,
        DeliveryStatus.CANCELLED,
      ],
      [DeliveryStatus.PROCESSING]: [
        DeliveryStatus.SHIPPED,
        DeliveryStatus.CANCELLED,
      ],
      [DeliveryStatus.SHIPPED]: [
        DeliveryStatus.DELIVERED,
        DeliveryStatus.CANCELLED,
      ],
      [DeliveryStatus.DELIVERED]: [], // Final status
      [DeliveryStatus.CANCELLED]: [DeliveryStatus.PENDING], // Can be rescheduled
    };

    const isAllowed =
      allowedTransitions[currentStatus]?.includes(newStatus) || false;

    this.validateBusinessRule(
      isAllowed,
      `Invalid delivery status transition from ${currentStatus} to ${newStatus}`,
    );

    return true;
  }

  /**
   * Updates delivery status with business rules validation
   */
  updateDeliveryStatus(
    delivery: DeliveryDomain,
    newStatus: DeliveryStatus,
    trackingNotes?: string,
  ): DeliveryDomain {
    this.logDomainOperation('updateDeliveryStatus', {
      deliveryId: delivery.id,
      oldStatus: delivery.status,
      newStatus,
      hasNotes: !!trackingNotes,
    });

    this.canTransitionToStatus(delivery.status, newStatus);

    // Use the entity's own update method to create a new instance
    let updatedDelivery = delivery.updateStatus(newStatus);

    // Add tracking notes if provided
    if (trackingNotes) {
      const currentNotes = delivery.deliveryNotes || '';
      const timestamp = new Date().toISOString();
      const newNotes =
        `${currentNotes}\n[${timestamp}] ${trackingNotes}`.trim();

      // Create a new instance with updated notes
      updatedDelivery = new DeliveryDomain(
        updatedDelivery.id,
        updatedDelivery.transactionId,
        updatedDelivery.deliveryAddressId,
        updatedDelivery.trackingNumber,
        updatedDelivery.carrier,
        updatedDelivery.status,
        updatedDelivery.estimatedDeliveryDate,
        updatedDelivery.shippedAt,
        updatedDelivery.deliveredAt,
        newNotes,
        updatedDelivery.createdAt,
        updatedDelivery.updatedAt,
      );
    }

    return updatedDelivery;
  }

  /**
   * Calculates estimated delivery time
   * Business rule: Standard delivery is 2-5 business days
   */
  calculateEstimatedDelivery(orderDate: Date, priorityDelivery = false): Date {
    this.logDomainOperation('calculateEstimatedDelivery', {
      orderDate,
      priorityDelivery,
    });

    this.validateBusinessRule(
      orderDate <= new Date(),
      'Order date cannot be in the future',
    );

    const deliveryDays = priorityDelivery ? 1 : 3; // 1 day for priority, 3 for standard
    const estimatedDate = new Date(orderDate);
    estimatedDate.setDate(estimatedDate.getDate() + deliveryDays);

    // Skip weekends for business days calculation
    while (estimatedDate.getDay() === 0 || estimatedDate.getDay() === 6) {
      estimatedDate.setDate(estimatedDate.getDate() + 1);
    }

    return estimatedDate;
  }

  /**
   * Validates delivery data
   */
  validateDeliveryData(deliveryData: Partial<DeliveryDomain>): void {
    this.logDomainOperation('validateDeliveryData', 'Validating delivery data');

    if (deliveryData.estimatedDeliveryDate) {
      this.validateBusinessRule(
        deliveryData.estimatedDeliveryDate >= new Date(),
        'Estimated delivery date cannot be in the past',
      );
    }

    if (deliveryData.deliveredAt && deliveryData.estimatedDeliveryDate) {
      this.validateBusinessRule(
        deliveryData.deliveredAt <= new Date(),
        'Delivered date cannot be in the future',
      );
    }

    if (deliveryData.trackingNumber) {
      this.validateBusinessRule(
        deliveryData.trackingNumber.trim().length > 0,
        'Tracking number cannot be empty',
      );
    }
  }

  /**
   * Checks if delivery is overdue
   * Business rule: Delivery is overdue if current date > estimated date + 1 day grace period
   */
  isDeliveryOverdue(delivery: DeliveryDomain): boolean {
    this.logDomainOperation('isDeliveryOverdue', {
      deliveryId: delivery.id,
      status: delivery.status,
      estimatedDate: delivery.estimatedDeliveryDate,
    });

    // Only check for overdue if delivery is still in transit
    if (
      delivery.status === DeliveryStatus.DELIVERED ||
      delivery.status === DeliveryStatus.CANCELLED
    ) {
      return false;
    }

    if (!delivery.estimatedDeliveryDate) {
      return false;
    }

    const gracePeriod = 24 * 60 * 60 * 1000; // 1 day in milliseconds
    const overdueThreshold =
      delivery.estimatedDeliveryDate.getTime() + gracePeriod;

    return Date.now() > overdueThreshold;
  }

  /**
   * Generates tracking number
   * Business rule: Format DEL-YYYYMMDD-XXXXX
   */
  generateTrackingNumber(): string {
    this.logDomainOperation(
      'generateTrackingNumber',
      'Generating tracking number',
    );

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 99999)
      .toString()
      .padStart(5, '0');

    return `DEL-${year}${month}${day}-${random}`;
  }
}
