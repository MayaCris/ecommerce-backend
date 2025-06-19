import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';

@Entity('transaction_items')
@Check(`"quantity" > 0`)
@Check(`"unit_price" >= 0`)
@Check(`"total_price" >= 0`)
export class TransactionItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'transaction_id',
    type: 'uuid',
    nullable: false,
  })
  transactionId: string;

  @Column({
    name: 'product_id',
    type: 'uuid',
    nullable: false,
  })
  productId: string;

  @Column({
    type: 'int',
    nullable: false,
  })
  quantity: number;

  @Column({
    name: 'unit_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  unitPrice: number;

  @Column({
    name: 'total_price',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  totalPrice: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  // Relations using string references to avoid circular imports
  @ManyToOne('TransactionEntity', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'transaction_id' })
  transaction: any;

  @ManyToOne('ProductEntity')
  @JoinColumn({ name: 'product_id' })
  product: any;
}
