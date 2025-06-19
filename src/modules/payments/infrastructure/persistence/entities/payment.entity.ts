import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PaymentMethod } from '../../../../../shared/domain/enums/payment-method.enum';
import { PaymentStatus } from '../../../../../shared/domain/enums/payment-status.enum';

@Entity('payments')
export class PaymentEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  reference: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: 'COP' })
  currency: string;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @Column({ name: 'transaction_id', type: 'uuid' })
  transactionId: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CARD,
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    name: 'api_transaction_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  apiTransactionId?: string;

  @Column({
    name: 'api_reference',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  apiReference?: string;

  @Column({
    name: 'status_message',
    type: 'text',
    nullable: true,
  })
  statusMessage?: string;

  @Column({
    name: 'processing_date',
    type: 'timestamp',
    nullable: true,
  })
  processingDate?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
