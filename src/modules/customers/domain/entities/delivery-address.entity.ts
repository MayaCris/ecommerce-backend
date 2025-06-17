import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';

@Entity('delivery_addresses')
@Index('idx_delivery_addresses_unique_default', ['customerId'], {
  unique: true,
  where: 'is_default = true',
})
export class DeliveryAddress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'customer_id',
    type: 'uuid',
    nullable: false,
  })
  customerId: string;

  @Column({
    name: 'street_address',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  streetAddress: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  city: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  state: string;

  @Column({
    name: 'postal_code',
    type: 'varchar',
    length: 20,
    nullable: false,
  })
  postalCode: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    default: 'Colombia',
  })
  country: string;

  @Column({
    name: 'additional_info',
    type: 'text',
    nullable: true,
  })
  additionalInfo: string;

  @Column({
    name: 'is_default',
    type: 'boolean',
    default: false,
  })
  isDefault: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  // Relations using string references to avoid circular imports
  @ManyToOne('Customer', 'deliveryAddresses', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: any;

  @OneToMany('Transaction', 'deliveryAddress')
  transactions: any[];

  @OneToMany('Delivery', 'deliveryAddress')
  deliveries: any[];
}
