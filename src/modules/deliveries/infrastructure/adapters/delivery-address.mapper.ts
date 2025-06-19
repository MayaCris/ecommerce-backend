import { Injectable } from '@nestjs/common';
import { DeliveryAddressEntity } from '../persistence/entities/delivery-address.entity';
import { DeliveryAddressDomain } from '../../domain/entities/delivery-address-domain.entity';

/**
 * Mapper between DeliveryAddress Domain Entity and Persistence Entity
 */
@Injectable()
export class DeliveryAddressMapper {
  /**
   * Maps from persistence entity to domain entity
   */
  static toDomain(entity: DeliveryAddressEntity): DeliveryAddressDomain {
    if (!entity) {
      throw new Error('DeliveryAddressEntity cannot be null or undefined');
    }

    return new DeliveryAddressDomain(
      entity.id,
      entity.customerId,
      entity.streetAddress,
      entity.city,
      entity.state,
      entity.postalCode,
      entity.country,
      entity.additionalInfo,
      entity.isDefault,
      entity.createdAt,
    );
  }

  /**
   * Maps from domain entity to persistence entity
   */
  static toPersistence(domain: DeliveryAddressDomain): DeliveryAddressEntity {
    if (!domain) {
      throw new Error('DeliveryAddressDomain cannot be null or undefined');
    }

    const entity = new DeliveryAddressEntity();
    entity.id = domain.id;
    entity.customerId = domain.customerId;
    entity.streetAddress = domain.streetAddress;
    entity.city = domain.city;
    entity.state = domain.state;
    entity.postalCode = domain.postalCode;
    entity.country = domain.country;
    entity.additionalInfo = domain.additionalInfo;
    entity.isDefault = domain.isDefault;
    entity.createdAt = domain.createdAt;

    return entity;
  }

  /**
   * Maps array of persistence entities to array of domain entities
   */
  static toDomainArray(
    entities: DeliveryAddressEntity[],
  ): DeliveryAddressDomain[] {
    if (!entities) {
      return [];
    }
    return entities.map((entity) => this.toDomain(entity));
  }

  /**
   * Maps array of domain entities to array of persistence entities
   */
  static toPersistenceArray(
    domains: DeliveryAddressDomain[],
  ): DeliveryAddressEntity[] {
    if (!domains) {
      return [];
    }
    return domains.map((domain) => this.toPersistence(domain));
  }

  /**
   * Maps partial persistence entity for updates
   */
  static toPersistenceForUpdate(
    existingEntity: DeliveryAddressEntity,
    updateData: Partial<DeliveryAddressDomain>,
  ): DeliveryAddressEntity {
    const updatedEntity = { ...existingEntity };

    if (updateData.streetAddress !== undefined) {
      updatedEntity.streetAddress = updateData.streetAddress;
    }
    if (updateData.city !== undefined) {
      updatedEntity.city = updateData.city;
    }
    if (updateData.state !== undefined) {
      updatedEntity.state = updateData.state;
    }
    if (updateData.postalCode !== undefined) {
      updatedEntity.postalCode = updateData.postalCode;
    }
    if (updateData.country !== undefined) {
      updatedEntity.country = updateData.country;
    }
    if (updateData.additionalInfo !== undefined) {
      updatedEntity.additionalInfo = updateData.additionalInfo;
    }
    if (updateData.isDefault !== undefined) {
      updatedEntity.isDefault = updateData.isDefault;
    }

    return updatedEntity;
  }
}
