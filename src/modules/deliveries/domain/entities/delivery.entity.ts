import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DeliveryStatus } from '../../../../shared/domain/enums/delivery-status.enum';

@Entity('deliveries')
export class Delivery {
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

  @Column({
    name: 'tracking_number',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  trackingNumber: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  carrier: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    nullable: false,
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @Column({
    name: 'estimated_delivery_date',
    type: 'date',
    nullable: true,
  })
  estimatedDeliveryDate: Date;

  @Column({
    name: 'shipped_at',
    type: 'timestamptz',
    nullable: true,
  })
  shippedAt: Date;

  @Column({
    name: 'delivered_at',
    type: 'timestamptz',
    nullable: true,
  })
  deliveredAt: Date;

  @Column({
    name: 'delivery_notes',
    type: 'text',
    nullable: true,
  })
  deliveryNotes: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // Relations using string references to avoid circular imports
  @OneToOne('Transaction', 'delivery', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transaction_id' })
  transaction: any;

  @ManyToOne('DeliveryAddress', 'deliveries')
  @JoinColumn({ name: 'delivery_address_id' })
  deliveryAddress: any;
}
