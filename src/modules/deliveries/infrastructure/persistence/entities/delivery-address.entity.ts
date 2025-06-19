import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * DeliveryAddress Entity for TypeORM
 * Matches the actual database table 'delivery_addresses' structure
 */
@Entity('delivery_addresses')
@Index(['customerId'])
@Index(['customerId', 'isDefault'], {
  unique: true,
  where: 'is_default = true',
})
export class DeliveryAddressEntity {
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
  additionalInfo: string | null;

  @Column({
    name: 'is_default',
    type: 'boolean',
    default: false,
  })
  isDefault: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;
}
