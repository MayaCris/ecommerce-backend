import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { TransactionStatus } from '../../../../../shared/domain/enums/transaction-status.enum';
import { CardType } from '../../../../../shared/domain/enums/card-type.enum';

/**
 * Transaction Entity for TypeORM
 * Matches the actual database table 'transactions' structure
 */
@Entity('transactions')
@Index(['customerId'])
@Index(['transactionNumber'], { unique: true })
@Index(['status'])
@Index(['createdAt'])
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'transaction_number',
    type: 'varchar',
    length: 50,
    unique: true,
    nullable: false,
  })
  transactionNumber: string;

  @Column({
    name: 'customer_id',
    type: 'uuid',
    nullable: false,
  })
  customerId: string;

  @Column({
    name: 'delivery_address_id',
    type: 'uuid',
    nullable: false,
  })
  deliveryAddressId: string;

  // Payment information
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  subtotal: string;

  @Column({
    name: 'base_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: '0',
  })
  baseFee: string;

  @Column({
    name: 'delivery_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: '0',
  })
  deliveryFee: string;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  totalAmount: string;

  // Transaction status and external references
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    nullable: false,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({
    name: 'api_transaction_id',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  apiTransactionId: string | null;

  @Column({
    name: 'api_reference',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  apiReference: string | null;

  // Payment method information
  @Column({
    name: 'card_type',
    type: 'enum',
    enum: CardType,
    nullable: true,
  })
  cardType: CardType | null;

  @Column({
    name: 'card_last_four_digits',
    type: 'char',
    length: 4,
    nullable: true,
  })
  cardLastFourDigits: string | null;

  // Audit fields
  @Column({
    name: 'processed_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  processedAt: Date | null;

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
