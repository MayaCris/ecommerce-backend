import { TransactionItemDomain } from '../../../domain/entities/transaction-item-domain.entity';
import { TransactionItemEntity } from '../entities/transaction-item.entity';

/**
 * Transaction Item Mapper
 * Converts between TransactionItemDomain (business logic) and TransactionItem (persistence)
 */
export class TransactionItemMapper {
  /**
   * Convert from TransactionItem Entity to TransactionItemDomain
   */
  static toDomain(entity: TransactionItemEntity): TransactionItemDomain {
    // Convert numeric values ensuring they are numbers
    const quantity =
      typeof entity.quantity === 'string'
        ? parseInt(entity.quantity)
        : entity.quantity;
    const unitPrice =
      typeof entity.unitPrice === 'string'
        ? parseFloat(entity.unitPrice)
        : entity.unitPrice;
    const totalPrice =
      typeof entity.totalPrice === 'string'
        ? parseFloat(entity.totalPrice)
        : entity.totalPrice;

    return TransactionItemDomain.create({
      id: entity.id,
      transactionId: entity.transactionId,
      productId: entity.productId,
      quantity,
      unitPrice,
      totalPrice,
      currency: 'USD', // Default currency
      createdAt: entity.createdAt,
    });
  }

  /**
   * Convert from TransactionItemDomain to TransactionItem Entity
   */
  static toEntity(domain: TransactionItemDomain): TransactionItemEntity {
    const entity = new TransactionItemEntity();

    // Only set ID if it's not a temporary ID (for new entities, let TypeORM generate UUID)
    if (domain.id !== 'temp-id') {
      entity.id = domain.id;
    }
    entity.transactionId = domain.transactionId;
    entity.productId = domain.productId;
    entity.quantity = domain.quantity.amount;
    entity.unitPrice = domain.unitPrice.amount;
    entity.totalPrice = domain.totalPrice.amount;
    entity.createdAt = domain.createdAt;

    return entity;
  }

  /**
   * Convert array of entities to array of domains
   */
  static toDomainArray(
    entities: TransactionItemEntity[],
  ): TransactionItemDomain[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  /**
   * Convert array of domains to array of entities
   */
  static toEntityArray(
    domains: TransactionItemDomain[],
  ): TransactionItemEntity[] {
    return domains.map((domain) => this.toEntity(domain));
  }

  /**
   * Create a new entity from domain data (for inserts)
   */
  static createEntity(domain: TransactionItemDomain): TransactionItemEntity {
    const entity = new TransactionItemEntity();

    // Don't set ID - let DB generate it
    entity.transactionId = domain.transactionId;
    entity.productId = domain.productId;
    entity.quantity = domain.quantity.amount;
    entity.unitPrice = domain.unitPrice.amount;
    entity.totalPrice = domain.totalPrice.amount;
    // Don't set createdAt - let DB handle it

    return entity;
  }

  /**
   * Update existing entity with domain data
   */
  static updateEntity(
    entity: TransactionItemEntity,
    domain: TransactionItemDomain,
  ): TransactionItemEntity {
    entity.transactionId = domain.transactionId;
    entity.productId = domain.productId;
    entity.quantity = domain.quantity.amount;
    entity.unitPrice = domain.unitPrice.amount;
    entity.totalPrice = domain.totalPrice.amount;

    return entity;
  }
}
