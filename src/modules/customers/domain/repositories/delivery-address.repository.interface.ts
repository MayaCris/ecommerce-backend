import { DeliveryAddress } from '../entities/delivery-address.entity';
import { IBaseRepository } from '../../../../shared/domain/repositories/base.repository.interface';

/**
 * Delivery Address repository interface
 * Defines all operations available for DeliveryAddress entities
 */
export interface IDeliveryAddressRepository
  extends IBaseRepository<DeliveryAddress> {
  /**
   * Find all addresses for a specific customer
   */
  findByCustomerId(customerId: string): Promise<DeliveryAddress[]>;

  /**
   * Find customer's default address
   */
  findDefaultByCustomerId(customerId: string): Promise<DeliveryAddress | null>;

  /**
   * Set address as default (removes default from others)
   */
  setAsDefault(
    addressId: string,
    customerId: string,
  ): Promise<DeliveryAddress | null>;

  /**
   * Find addresses by city
   */
  findByCity(city: string): Promise<DeliveryAddress[]>;

  /**
   * Find addresses by postal code
   */
  findByPostalCode(postalCode: string): Promise<DeliveryAddress[]>;

  /**
   * Count addresses per customer
   */
  countByCustomerId(customerId: string): Promise<number>;
}
