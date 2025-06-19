import { Injectable } from '@nestjs/common';
import { DeliveryEntity } from '../persistence/entities/delivery.entity';
import { DeliveryDomain } from '../../domain/entities/delivery-domain.entity';

/**
 * Mapper between Delivery Domain Entity and Persistence Entity
 */
@Injectable()
export class DeliveryMapper {
  /**
   * Maps from persistence entity to domain entity
   */
  static toDomain(entity: DeliveryEntity): DeliveryDomain {
    if (!entity) {
      throw new Error('DeliveryEntity cannot be null or undefined');
    }

    return new DeliveryDomain(
      entity.id,
      entity.transactionId,
      entity.deliveryAddressId,
      entity.trackingNumber,
      entity.carrier,
      entity.status,
      entity.estimatedDeliveryDate,
      entity.shippedAt,
      entity.deliveredAt,
      entity.deliveryNotes,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  /**
   * Maps from domain entity to persistence entity
   */
  static toPersistence(domain: DeliveryDomain): DeliveryEntity {
    if (!domain) {
      throw new Error('DeliveryDomain cannot be null or undefined');
    }

    const entity = new DeliveryEntity();
    entity.id = domain.id;
    entity.transactionId = domain.transactionId;
    entity.deliveryAddressId = domain.deliveryAddressId;
    entity.trackingNumber = domain.trackingNumber;
    entity.carrier = domain.carrier;
    entity.status = domain.status;
    entity.estimatedDeliveryDate = domain.estimatedDeliveryDate;
    entity.shippedAt = domain.shippedAt;
    entity.deliveredAt = domain.deliveredAt;
    entity.deliveryNotes = domain.deliveryNotes;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    return entity;
  }

  /**
   * Maps array of persistence entities to array of domain entities
   */
  static toDomainArray(entities: DeliveryEntity[]): DeliveryDomain[] {
    if (!entities) {
      return [];
    }
    return entities.map((entity) => this.toDomain(entity));
  }

  /**
   * Maps array of domain entities to array of persistence entities
   */
  static toPersistenceArray(domains: DeliveryDomain[]): DeliveryEntity[] {
    if (!domains) {
      return [];
    }
    return domains.map((domain) => this.toPersistence(domain));
  }

  /**
   * Maps partial persistence entity for updates
   */
  static toPersistenceForUpdate(
    existingEntity: DeliveryEntity,
    updateData: Partial<DeliveryDomain>,
  ): DeliveryEntity {
    const updatedEntity = { ...existingEntity };

    if (updateData.trackingNumber !== undefined) {
      updatedEntity.trackingNumber = updateData.trackingNumber;
    }
    if (updateData.carrier !== undefined) {
      updatedEntity.carrier = updateData.carrier;
    }
    if (updateData.status !== undefined) {
      updatedEntity.status = updateData.status;
    }
    if (updateData.estimatedDeliveryDate !== undefined) {
      updatedEntity.estimatedDeliveryDate = updateData.estimatedDeliveryDate;
    }
    if (updateData.shippedAt !== undefined) {
      updatedEntity.shippedAt = updateData.shippedAt;
    }
    if (updateData.deliveredAt !== undefined) {
      updatedEntity.deliveredAt = updateData.deliveredAt;
    }
    if (updateData.deliveryNotes !== undefined) {
      updatedEntity.deliveryNotes = updateData.deliveryNotes;
    }

    // Always update the updatedAt field
    updatedEntity.updatedAt = new Date();

    return updatedEntity;
  }
}
