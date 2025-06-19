import { CustomerDomain } from '../../../domain/entities/customer-domain.entity';
import { CustomerEntity } from '../entities/customer.entity';
import { Email, PhoneNumber } from '../../../../../shared/domain/value-objects';

/**
 * Mapper between Customer Domain and Persistence entities
 * Handles conversion between Value Objects and primitive types
 */
export class CustomerMapper {
  /**
   * Convert from Entity (primitives) to Domain (with Value Objects)
   */
  static toDomain(entity: CustomerEntity): CustomerDomain {
    // Convert primitive email to Email VO
    const email = new Email(entity.email);

    // Convert primitive phone to PhoneNumber VO (if exists)
    const phone = entity.phone ? new PhoneNumber(entity.phone) : null;

    return CustomerDomain.create({
      id: entity.id,
      email,
      firstName: entity.firstName,
      lastName: entity.lastName,
      phone,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  /**
   * Convert from Domain (Value Objects) to Entity (primitives)
   */
  static toEntity(domain: CustomerDomain): CustomerEntity {
    const entity = new CustomerEntity();

    entity.id = domain.id;
    entity.email = domain.email.address;
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.phone = domain.phone?.getNumber() || null;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    return entity;
  }

  /**
   * Create a new Entity from Domain (for new records)
   */
  static createEntity(domain: CustomerDomain): CustomerEntity {
    const entity = new CustomerEntity();

    // Don't set ID - let DB generate it if needed
    entity.email = domain.email.address;
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.phone = domain.phone?.getNumber() || null;
    // Don't set timestamps - let DB handle them

    return entity;
  }

  /**
   * Update existing Entity with Domain data
   */
  static updateEntity(
    entity: CustomerEntity,
    domain: CustomerDomain,
  ): CustomerEntity {
    entity.email = domain.email.address;
    entity.firstName = domain.firstName;
    entity.lastName = domain.lastName;
    entity.phone = domain.phone?.getNumber() || null;
    entity.updatedAt = new Date();

    return entity;
  }

  /**
   * Convert array of entities to domain array
   */
  static toDomainArray(entities: CustomerEntity[]): CustomerDomain[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  /**
   * Convert array of domains to entity array
   */
  static toEntityArray(domains: CustomerDomain[]): CustomerEntity[] {
    return domains.map((domain) => this.toEntity(domain));
  }
}
