import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionItemDomain } from '../../../domain/entities/transaction-item-domain.entity';
import { ITransactionItemRepository } from '../../../domain/repositories/transaction-item.repository.interface';
import { TransactionItemEntity } from '../entities/transaction-item.entity';
import { TransactionItemMapper } from '../mappers/transaction-item.mapper';

/**
 * Transaction Item Repository Implementation
 * Handles persistence operations for TransactionItemDomain entities
 */
@Injectable()
export class TransactionItemRepository implements ITransactionItemRepository {
  constructor(
    @InjectRepository(TransactionItemEntity)
    private readonly repository: Repository<TransactionItemEntity>,
  ) {}

  /**
   * Find all transaction items
   */
  async findAll(): Promise<TransactionItemDomain[]> {
    const entities = await this.repository.find({
      order: { createdAt: 'DESC' },
    });
    return TransactionItemMapper.toDomainArray(entities);
  }

  /**
   * Find transaction item by ID
   */
  async findById(id: string): Promise<TransactionItemDomain | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? TransactionItemMapper.toDomain(entity) : null;
  }

  /**
   * Create a new transaction item
   */
  async create(domain: TransactionItemDomain): Promise<TransactionItemDomain> {
    const entity = TransactionItemMapper.createEntity(domain);
    const savedEntity = await this.repository.save(entity);
    return TransactionItemMapper.toDomain(savedEntity);
  }

  /**
   * Update an existing transaction item
   */
  async update(
    id: string,
    domain: TransactionItemDomain,
  ): Promise<TransactionItemDomain | null> {
    const existingEntity = await this.repository.findOne({ where: { id } });
    if (!existingEntity) {
      return null;
    }

    const updatedEntity = TransactionItemMapper.updateEntity(
      existingEntity,
      domain,
    );
    const savedEntity = await this.repository.save(updatedEntity);
    return TransactionItemMapper.toDomain(savedEntity);
  }

  /**
   * Delete a transaction item
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Find all items for a specific transaction
   */
  async findByTransactionId(
    transactionId: string,
  ): Promise<TransactionItemDomain[]> {
    const entities = await this.repository.find({
      where: { transactionId },
      order: { createdAt: 'ASC' },
    });
    return TransactionItemMapper.toDomainArray(entities);
  }

  /**
   * Find all transactions that include a specific product
   */
  async findByProductId(productId: string): Promise<TransactionItemDomain[]> {
    const entities = await this.repository.find({
      where: { productId },
      order: { createdAt: 'DESC' },
    });
    return TransactionItemMapper.toDomainArray(entities);
  }

  /**
   * Count items by transaction ID
   */
  async countByTransactionId(transactionId: string): Promise<number> {
    return await this.repository.count({
      where: { transactionId },
    });
  }

  /**
   * Delete all items for a transaction
   */
  async deleteByTransactionId(transactionId: string): Promise<boolean> {
    const result = await this.repository.delete({ transactionId });
    return (result.affected ?? 0) > 0;
  }

  /**
   * Calculate total quantity sold for a product
   */
  async getTotalQuantitySold(
    productId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const queryBuilder = this.repository
      .createQueryBuilder('item')
      .select('SUM(item.quantity)', 'total')
      .where('item.productId = :productId', { productId });

    if (startDate) {
      queryBuilder.andWhere('item.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('item.createdAt <= :endDate', { endDate });
    }

    const result: { total: string } | undefined =
      await queryBuilder.getRawOne();
    const totalValue = result?.total || '0';
    return parseInt(totalValue, 10);
  }

  /**
   * Find best selling products
   */
  async findBestSellingProducts(
    limit: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('item')
      .select('item.productId', 'productId')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.totalPrice)', 'totalRevenue')
      .groupBy('item.productId')
      .orderBy('totalQuantity', 'DESC')
      .limit(limit);

    if (startDate) {
      queryBuilder.andWhere('item.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      queryBuilder.andWhere('item.createdAt <= :endDate', { endDate });
    }

    return await queryBuilder.getRawMany();
  }

  /**
   * Calculate total items value for a transaction
   */
  async calculateTransactionTotal(transactionId: string): Promise<number> {
    const result: { total: string } | undefined = await this.repository
      .createQueryBuilder('item')
      .select('SUM(item.totalPrice)', 'total')
      .where('item.transactionId = :transactionId', { transactionId })
      .getRawOne();

    const totalValue = result?.total || '0';
    return parseFloat(totalValue);
  }

  /**
   * Check if entity exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  /**
   * Count total entities with optional filtering
   */
  async count(): Promise<number> {
    return await this.repository.count();
  }
}
