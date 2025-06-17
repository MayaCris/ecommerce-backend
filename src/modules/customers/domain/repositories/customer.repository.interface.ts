import { Customer } from '../entities/customer.entity';
import { IBaseRepository } from '../../../../shared/domain/repositories/base.repository.interface';

/**
 * Customer repository interface
 * Defines all operations available for Customer entities
 */
export interface ICustomerRepository extends IBaseRepository<Customer> {
  /**
   * Find customer by email (unique)
   */
  findByEmail(email: string): Promise<Customer | null>;

  /**
   * Find customer by phone number
   */
  findByPhone(phone: string): Promise<Customer | null>;

  /**
   * Find customers by name (partial match)
   */
  findByName(name: string): Promise<Customer[]>;

  /**
   * Find customers created within date range
   */
  findByDateRange(startDate: Date, endDate: Date): Promise<Customer[]>;

  /**
   * Check if email is already registered
   */
  isEmailTaken(email: string): Promise<boolean>;

  /**
   * Update customer last activity timestamp
   */
  updateLastActivity(id: string): Promise<void>;

  /**
   * Find customers with recent activity
   */
  findActiveCustomers(daysAgo: number): Promise<Customer[]>;
}
