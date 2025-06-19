import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { DeliveryStatus } from '../../../../../shared/domain/enums/delivery-status.enum';

/**
 * Delivery Entity for TypeORM
 * Matches the actual database table 'deliveries' structure
 */
@Entity('deliveries')
@Index(['transactionId'], { unique: true })
@Index(['deliveryAddressId'])
@Index(['status'])
@Index(['trackingNumber'])
@Index(['createdAt'])
export class DeliveryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'transaction_id',
    type: 'uuid',
    unique: true,
    nullable: false,
  })
  transactionId: string;

  @Column({
    name: 'delivery_address_id',
    type: 'uuid',
    nullable: false,
  })
  deliveryAddressId: string;

  // Delivery tracking
  @Column({
    name: 'tracking_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  trackingNumber: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  carrier: string | null;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    nullable: false,
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  // Delivery timeline
  @Column({
    name: 'estimated_delivery_date',
    type: 'date',
    nullable: true,
  })
  estimatedDeliveryDate: Date | null;

  @Column({
    name: 'shipped_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  shippedAt: Date | null;

  @Column({
    name: 'delivered_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  deliveredAt: Date | null;

  // Additional information
  @Column({
    name: 'delivery_notes',
    type: 'text',
    nullable: true,
  })
  deliveryNotes: string | null;

  // Audit fields
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt: Date;
}
