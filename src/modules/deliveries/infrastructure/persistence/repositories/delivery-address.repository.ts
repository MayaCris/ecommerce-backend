import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryAddressEntity } from '../entities/delivery-address.entity';
import { DeliveryAddressDomain } from '../../../domain/entities/delivery-address-domain.entity';
import { DeliveryAddressMapper } from '../../adapters/delivery-address.mapper';
import { IDeliveryAddressRepository } from '../../../domain/repositories/delivery-address.repository.interface';
import { FindOptions } from '../../../../../shared/domain/repositories/base.repository.interface';

/**
 * Delivery Address Repository Implementation using TypeORM
 * Handles CRUD operations for delivery addresses
 */
@Injectable()
export class DeliveryAddressRepository implements IDeliveryAddressRepository {
  constructor(
    @InjectRepository(DeliveryAddressEntity)
    private readonly deliveryAddressRepository: Repository<DeliveryAddressEntity>,
  ) {}

  /**
   * Find all delivery addresses with optional filtering
   */
  async findAll(
    options?: FindOptions<DeliveryAddressDomain>,
  ): Promise<DeliveryAddressDomain[]> {
    const queryBuilder =
      this.deliveryAddressRepository.createQueryBuilder('address');

    if (options?.where) {
      // Map domain filters to entity filters using proper business logic
      const domainWhere = options.where;

      if (domainWhere.customerId) {
        queryBuilder.andWhere('address.customerId = :customerId', {
          customerId: domainWhere.customerId,
        });
      }

      if (domainWhere.city) {
        queryBuilder.andWhere('address.city = :city', {
          city: domainWhere.city,
        });
      }

      if (domainWhere.state) {
        queryBuilder.andWhere('address.state = :state', {
          state: domainWhere.state,
        });
      }

      if (domainWhere.country) {
        queryBuilder.andWhere('address.country = :country', {
          country: domainWhere.country,
        });
      }

      if (domainWhere.postalCode) {
        queryBuilder.andWhere('address.postalCode = :postalCode', {
          postalCode: domainWhere.postalCode,
        });
      }

      if (domainWhere.isDefault !== undefined) {
        queryBuilder.andWhere('address.isDefault = :isDefault', {
          isDefault: domainWhere.isDefault,
        });
      }

      if (domainWhere.streetAddress) {
        queryBuilder.andWhere('address.streetAddress ILIKE :streetAddress', {
          streetAddress: `%${domainWhere.streetAddress}%`,
        });
      }
    }

    if (options?.orderBy) {
      const direction = options.orderDirection || 'ASC';
      queryBuilder.orderBy(`address.${String(options.orderBy)}`, direction);
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    const entities = await queryBuilder.getMany();
    return DeliveryAddressMapper.toDomainArray(entities);
  }

  /**
   * Find delivery address by ID
   */
  async findById(id: string): Promise<DeliveryAddressDomain | null> {
    const entity = await this.deliveryAddressRepository.findOne({
      where: { id },
    });

    return entity ? DeliveryAddressMapper.toDomain(entity) : null;
  }

  /**
   * Create a new delivery address
   */
  async create(
    deliveryAddress: Partial<DeliveryAddressDomain>,
  ): Promise<DeliveryAddressDomain> {
    const entity = this.deliveryAddressRepository.create(deliveryAddress);
    const savedEntity = await this.deliveryAddressRepository.save(entity);
    return DeliveryAddressMapper.toDomain(savedEntity);
  }

  /**
   * Update an existing delivery address
   */
  async update(
    id: string,
    deliveryAddress: Partial<DeliveryAddressDomain>,
  ): Promise<DeliveryAddressDomain | null> {
    const existingEntity = await this.deliveryAddressRepository.findOne({
      where: { id },
    });

    if (!existingEntity) {
      return null;
    }

    const updatedEntity = DeliveryAddressMapper.toPersistenceForUpdate(
      existingEntity,
      deliveryAddress,
    );

    const savedEntity =
      await this.deliveryAddressRepository.save(updatedEntity);
    return DeliveryAddressMapper.toDomain(savedEntity);
  }

  /**
   * Delete a delivery address
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.deliveryAddressRepository.delete(id);
    return (
      result.affected !== null &&
      result.affected !== undefined &&
      result.affected > 0
    );
  }

  /**
   * Check if delivery address exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.deliveryAddressRepository.count({
      where: { id },
    });
    return count > 0;
  }

  /**
   * Count total delivery addresses
   */
  async count(options?: FindOptions<DeliveryAddressDomain>): Promise<number> {
    const queryBuilder =
      this.deliveryAddressRepository.createQueryBuilder('address');

    if (options?.where) {
      // Map domain filters to entity filters
      const domainWhere = options.where;

      if (domainWhere.customerId) {
        queryBuilder.andWhere('address.customerId = :customerId', {
          customerId: domainWhere.customerId,
        });
      }

      if (domainWhere.city) {
        queryBuilder.andWhere('address.city = :city', {
          city: domainWhere.city,
        });
      }

      if (domainWhere.state) {
        queryBuilder.andWhere('address.state = :state', {
          state: domainWhere.state,
        });
      }

      if (domainWhere.country) {
        queryBuilder.andWhere('address.country = :country', {
          country: domainWhere.country,
        });
      }

      if (domainWhere.postalCode) {
        queryBuilder.andWhere('address.postalCode = :postalCode', {
          postalCode: domainWhere.postalCode,
        });
      }

      if (domainWhere.isDefault !== undefined) {
        queryBuilder.andWhere('address.isDefault = :isDefault', {
          isDefault: domainWhere.isDefault,
        });
      }
    }

    return await queryBuilder.getCount();
  }

  /**
   * Find all addresses for a specific customer
   */
  async findByCustomerId(customerId: string): Promise<DeliveryAddressDomain[]> {
    const entities = await this.deliveryAddressRepository.find({
      where: { customerId },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
    return DeliveryAddressMapper.toDomainArray(entities);
  }

  /**
   * Find customer's default address
   */
  async findDefaultByCustomerId(
    customerId: string,
  ): Promise<DeliveryAddressDomain | null> {
    const entity = await this.deliveryAddressRepository.findOne({
      where: {
        customerId,
        isDefault: true,
      },
    });

    return entity ? DeliveryAddressMapper.toDomain(entity) : null;
  }

  /**
   * Set address as default (removes default from others)
   */
  async setAsDefault(
    addressId: string,
    customerId: string,
  ): Promise<DeliveryAddressDomain | null> {
    // Start transaction
    return await this.deliveryAddressRepository.manager.transaction(
      async (manager) => {
        // Remove default flag from all customer addresses
        await manager.update(
          DeliveryAddressEntity,
          { customerId },
          { isDefault: false },
        );

        // Set the specified address as default
        await manager.update(
          DeliveryAddressEntity,
          { id: addressId, customerId },
          { isDefault: true },
        );

        // Return the updated address
        const entity = await manager.findOne(DeliveryAddressEntity, {
          where: { id: addressId },
        });

        return entity ? DeliveryAddressMapper.toDomain(entity) : null;
      },
    );
  }

  /**
   * Find addresses by city
   */
  async findByCity(city: string): Promise<DeliveryAddressDomain[]> {
    const entities = await this.deliveryAddressRepository.find({
      where: { city },
      order: { createdAt: 'DESC' },
    });
    return DeliveryAddressMapper.toDomainArray(entities);
  }

  /**
   * Find addresses by postal code
   */
  async findByPostalCode(postalCode: string): Promise<DeliveryAddressDomain[]> {
    const entities = await this.deliveryAddressRepository.find({
      where: { postalCode },
      order: { createdAt: 'DESC' },
    });
    return DeliveryAddressMapper.toDomainArray(entities);
  }

  /**
   * Count addresses per customer
   */
  async countByCustomerId(customerId: string): Promise<number> {
    return await this.deliveryAddressRepository.count({
      where: { customerId },
    });
  }
}
