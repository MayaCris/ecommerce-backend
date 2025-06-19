import { DeliveryAddressDomain } from '../entities/delivery-address-domain.entity';
import { IBaseRepository } from '../../../../shared/domain/repositories/base.repository.interface';

/**
 * Delivery Address repository interface
 * Defines all operations available for DeliveryAddress entities
 */
export interface IDeliveryAddressRepository
  extends IBaseRepository<DeliveryAddressDomain> {
  /**
   * Find all addresses for a specific customer
   */
  findByCustomerId(customerId: string): Promise<DeliveryAddressDomain[]>;

  /**
   * Find customer's default address
   */
  findDefaultByCustomerId(
    customerId: string,
  ): Promise<DeliveryAddressDomain | null>;

  /**
   * Set address as default (removes default from others)
   */
  setAsDefault(
    addressId: string,
    customerId: string,
  ): Promise<DeliveryAddressDomain | null>;

  /**
   * Find addresses by city
   */
  findByCity(city: string): Promise<DeliveryAddressDomain[]>;

  /**
   * Find addresses by postal code
   */
  findByPostalCode(postalCode: string): Promise<DeliveryAddressDomain[]>;

  /**
   * Count addresses per customer
   */
  countByCustomerId(customerId: string): Promise<number>;
}
