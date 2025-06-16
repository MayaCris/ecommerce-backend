import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('customers')
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  email: string;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  firstName: string;

  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  lastName: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  phone: string;

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

  // Relations will be added later to avoid circular imports
  @OneToMany('DeliveryAddress', 'customer')
  deliveryAddresses: any[];

  @OneToMany('Transaction', 'customer')
  transactions: any[];
}
