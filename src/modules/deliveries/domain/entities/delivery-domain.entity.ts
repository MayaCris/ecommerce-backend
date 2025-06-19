import { DeliveryStatus } from '../../../../shared/domain/enums/delivery-status.enum';

/**
 * Delivery Domain Entity
 * Pure domain entity without infrastructure concerns
 */
export class DeliveryDomain {
  constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public readonly deliveryAddressId: string,
    public readonly trackingNumber: string | null,
    public readonly carrier: string | null,
    public readonly status: DeliveryStatus,
    public readonly estimatedDeliveryDate: Date | null,
    public readonly shippedAt: Date | null,
    public readonly deliveredAt: Date | null,
    public readonly deliveryNotes: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Factory method to create a new delivery
   */
  static create(data: {
    id?: string;
    transactionId: string;
    deliveryAddressId: string;
    trackingNumber?: string | null;
    carrier?: string | null;
    status?: DeliveryStatus;
    estimatedDeliveryDate?: Date | null;
    shippedAt?: Date | null;
    deliveredAt?: Date | null;
    deliveryNotes?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): DeliveryDomain {
    return new DeliveryDomain(
      data.id || '',
      data.transactionId,
      data.deliveryAddressId,
      data.trackingNumber || null,
      data.carrier || null,
      data.status || DeliveryStatus.PENDING,
      data.estimatedDeliveryDate || null,
      data.shippedAt || null,
      data.deliveredAt || null,
      data.deliveryNotes || null,
      data.createdAt || new Date(),
      data.updatedAt || new Date(),
    );
  }

  /**
   * Business logic: Check if delivery is in progress
   */
  isInProgress(): boolean {
    return [
      DeliveryStatus.PENDING,
      DeliveryStatus.PROCESSING,
      DeliveryStatus.SHIPPED,
    ].includes(this.status);
  }

  /**
   * Business logic: Check if delivery is completed
   */
  isCompleted(): boolean {
    return (
      this.status === DeliveryStatus.DELIVERED && this.deliveredAt !== null
    );
  }

  /**
   * Business logic: Check if delivery can be cancelled
   */
  canBeCancelled(): boolean {
    return [DeliveryStatus.PENDING].includes(this.status);
  }

  /**
   * Business logic: Update status with business rules
   */
  updateStatus(newStatus: DeliveryStatus): DeliveryDomain {
    // Business rule: Can't go backwards in delivery process
    const statusOrder: Record<DeliveryStatus, number> = {
      [DeliveryStatus.PENDING]: 0,
      [DeliveryStatus.PROCESSING]: 1,
      [DeliveryStatus.SHIPPED]: 2,
      [DeliveryStatus.DELIVERED]: 3,
      [DeliveryStatus.CANCELLED]: -1,
    };

    const currentOrder = statusOrder[this.status];
    const newOrder = statusOrder[newStatus];

    if (newOrder < currentOrder && newStatus !== DeliveryStatus.CANCELLED) {
      throw new Error(
        `Cannot change status from ${this.status} to ${newStatus}`,
      );
    }

    return new DeliveryDomain(
      this.id,
      this.transactionId,
      this.deliveryAddressId,
      this.trackingNumber,
      this.carrier,
      newStatus,
      this.estimatedDeliveryDate,
      newStatus === DeliveryStatus.SHIPPED ? new Date() : this.shippedAt,
      newStatus === DeliveryStatus.DELIVERED ? new Date() : this.deliveredAt,
      this.deliveryNotes,
      this.createdAt,
      new Date(),
    );
  }
}
