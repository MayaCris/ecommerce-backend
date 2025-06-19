import { TransactionDomain } from '../../../domain/entities/transaction-domain.entity';
import { TransactionEntity } from '../entities/transaction.entity';
import { Money } from '../../../../../shared/domain/value-objects/monetary/money.value-object';
import { TransactionStatus } from '../../../../../shared/domain/enums/transaction-status.enum';

/**
 * Transaction Mapper
 * Converts between TransactionDomain (business logic) and TransactionEntity (persistence)
 * Updated to match real database structure
 */
export class TransactionMapper {
  /**
   * Convert from TransactionEntity to TransactionDomain
   */
  static toDomain(entity: TransactionEntity): TransactionDomain {
    // Create Money value objects for all monetary fields
    const subtotal = new Money(parseFloat(entity.subtotal), 'USD');
    const baseFee = new Money(parseFloat(entity.baseFee), 'USD');
    const deliveryFee = new Money(parseFloat(entity.deliveryFee), 'USD');
    const totalAmount = new Money(parseFloat(entity.totalAmount), 'USD');

    // Validate that status is a valid TransactionStatus
    if (!Object.values(TransactionStatus).includes(entity.status)) {
      throw new Error(`Invalid transaction status: ${entity.status}`);
    }

    return TransactionDomain.create({
      id: entity.id,
      transactionNumber: entity.transactionNumber,
      customerId: entity.customerId,
      deliveryAddressId: entity.deliveryAddressId,
      subtotal,
      baseFee,
      deliveryFee,
      totalAmount,
      status: entity.status,
      apiTransactionId: entity.apiTransactionId,
      apiReference: entity.apiReference,
      cardType: entity.cardType,
      cardLastFourDigits: entity.cardLastFourDigits,
      processedAt: entity.processedAt,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  /**
   * Convert from TransactionDomain to TransactionEntity
   */
  static toEntity(domain: TransactionDomain): TransactionEntity {
    const entity = new TransactionEntity();

    // Only set ID if it's not a temporary ID (for new entities, let TypeORM generate UUID)
    if (domain.id !== 'temp-id') {
      entity.id = domain.id;
    }
    entity.transactionNumber = domain.transactionNumber;
    entity.customerId = domain.customerId;
    entity.deliveryAddressId = domain.deliveryAddressId;
    entity.subtotal = domain.subtotal.amount.toString();
    entity.baseFee = domain.baseFee.amount.toString();
    entity.deliveryFee = domain.deliveryFee.amount.toString();
    entity.totalAmount = domain.totalAmount.amount.toString();
    entity.status = domain.status;
    entity.apiTransactionId = domain.apiTransactionId;
    entity.apiReference = domain.apiReference;
    entity.cardType = domain.cardType;
    entity.cardLastFourDigits = domain.cardLastFourDigits;
    entity.processedAt = domain.processedAt;
    entity.createdAt = domain.createdAt;
    entity.updatedAt = domain.updatedAt;

    return entity;
  }

  /**
   * Convert array of entities to array of domains
   */
  static toDomainArray(entities: TransactionEntity[]): TransactionDomain[] {
    return entities.map((entity) => this.toDomain(entity));
  }

  /**
   * Convert array of domains to array of entities
   */
  static toEntityArray(domains: TransactionDomain[]): TransactionEntity[] {
    return domains.map((domain) => this.toEntity(domain));
  }

  /**
   * Update existing entity with domain data (preserves id and timestamps)
   */
  static updateEntity(
    entity: TransactionEntity,
    domain: TransactionDomain,
  ): TransactionEntity {
    entity.transactionNumber = domain.transactionNumber;
    entity.customerId = domain.customerId;
    entity.deliveryAddressId = domain.deliveryAddressId;
    entity.subtotal = domain.subtotal.amount.toString();
    entity.baseFee = domain.baseFee.amount.toString();
    entity.deliveryFee = domain.deliveryFee.amount.toString();
    entity.totalAmount = domain.totalAmount.amount.toString();
    entity.status = domain.status;
    entity.apiTransactionId = domain.apiTransactionId;
    entity.apiReference = domain.apiReference;
    entity.cardType = domain.cardType;
    entity.cardLastFourDigits = domain.cardLastFourDigits;
    entity.processedAt = domain.processedAt;
    entity.updatedAt = domain.updatedAt;

    return entity;
  }
}
