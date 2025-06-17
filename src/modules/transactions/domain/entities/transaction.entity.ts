import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { TransactionStatus } from '../../../../shared/domain/enums/transaction-status.enum';
import { CardType } from '../../../../shared/domain/enums/card-type.enum';

@Entity('transactions')
@Check(`"subtotal" >= 0`)
@Check(`"base_fee" >= 0`)
@Check(`"delivery_fee" >= 0`)
@Check(`"total_amount" >= 0`)
export class Transaction {
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

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  subtotal: number;

  @Column({
    name: 'base_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
  })
  baseFee: number;

  @Column({
    name: 'delivery_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
    default: 0,
  })
  deliveryFee: number;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  totalAmount: number;

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
  apiTransactionId: string;

  @Column({
    name: 'api_reference',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  apiReference: string;

  @Column({
    name: 'card_type',
    type: 'enum',
    enum: CardType,
    nullable: true,
  })
  cardType: CardType;

  @Column({
    name: 'card_last_four_digits',
    type: 'char',
    length: 4,
    nullable: true,
  })
  cardLastFourDigits: string;

  @Column({
    name: 'processed_at',
    type: 'timestamptz',
    nullable: true,
  })
  processedAt: Date;

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
  @ManyToOne('Customer', 'transactions')
  @JoinColumn({ name: 'customer_id' })
  customer: any;

  @ManyToOne('DeliveryAddress', 'transactions')
  @JoinColumn({ name: 'delivery_address_id' })
  deliveryAddress: any;

  @OneToMany('TransactionItem', 'transaction', {
    cascade: true,
  })
  items: any[];

  @OneToOne('Delivery', 'transaction')
  delivery: any;
}
