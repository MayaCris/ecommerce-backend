import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('app_settings')
export class AppSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'setting_key',
    type: 'varchar',
    length: 100,
    unique: true,
    nullable: false,
  })
  settingKey: string;

  @Column({
    name: 'setting_value',
    type: 'varchar',
    length: 500,
    nullable: false,
  })
  settingValue: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

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
}
