import { ProductDomain } from '../../../domain/entities/product-domain.entity';
import { ProductEntity } from '../entities/product.entity';
import {
  Money,
  SKU,
  Quantity,
} from '../../../../../shared/domain/value-objects';

/**
 * Mapper between Domain and Persistence entities
 * Handles conversion between Value Objects and primitive types
 */
export class ProductMapper {
  /**
   * Converts from ProductEntity (persistence) to ProductDomain (domain)
   */
  public static toDomain(entity: ProductEntity): ProductDomain {
    // Convert database values to proper types
    const price =
      typeof entity.price === 'string'
        ? parseFloat(entity.price)
        : entity.price;
    const stockQuantity =
      typeof entity.stockQuantity === 'string'
        ? parseInt(entity.stockQuantity)
        : entity.stockQuantity;

    return new ProductDomain(
      entity.id,
      entity.name,
      entity.description,
      new Money(price, 'USD'), // Default currency USD
      new Quantity(stockQuantity),
      new SKU(entity.sku),
      entity.imageUrl,
      entity.isActive,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  /**
   * Converts from ProductDomain (domain) to ProductEntity (persistence)
   */
  public static toEntity(domain: ProductDomain): ProductEntity {
    const entity = new ProductEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.price = domain.price.amount;
    entity.stockQuantity = domain.stock.amount;
    entity.sku = domain.sku.code;
    entity.imageUrl = domain.imageUrl;
    entity.isActive = domain.isActive;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  /**
   * Converts array of ProductEntity to array of ProductDomain
   */
  public static toDomainArray(entities: ProductEntity[]): ProductDomain[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  /**
   * Converts array of ProductDomain to array of ProductEntity
   */
  public static toEntityArray(domains: ProductDomain[]): ProductEntity[] {
    return domains.map((domain) => this.toEntity(domain));
  }

  /**
   * Updates an existing entity with domain data
   * Useful for updates where we want to preserve the entity instance
   */
  public static updateEntity(
    entity: ProductEntity,
    domain: ProductDomain,
  ): ProductEntity {
    entity.name = domain.name;
    entity.description = domain.description;
    entity.price = domain.price.amount;
    entity.stockQuantity = domain.stock.amount;
    entity.sku = domain.sku.code;
    entity.imageUrl = domain.imageUrl;
    entity.isActive = domain.isActive;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }

  /**
   * Creates a new ProductEntity from domain data (for inserts)
   */
  public static createEntity(domain: ProductDomain): ProductEntity {
    const entity = new ProductEntity();
    entity.id = domain.id;
    entity.name = domain.name;
    entity.description = domain.description;
    entity.price = domain.price.amount;
    entity.stockQuantity = domain.stock.amount;
    entity.sku = domain.sku.code;
    entity.imageUrl = domain.imageUrl;
    entity.isActive = domain.isActive;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;
    return entity;
  }
}
