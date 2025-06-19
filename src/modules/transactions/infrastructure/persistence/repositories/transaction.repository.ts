import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { TransactionDomain } from '../../../domain/entities/transaction-domain.entity';
import {
  ITransactionRepository,
  TransactionStatistics,
} from '../../../domain/repositories/transaction.repository.interface';
import { TransactionEntity } from '../entities/transaction.entity';
import { TransactionMapper } from '../mappers/transaction.mapper';
import { TransactionStatus } from '../../../../../shared/domain/enums/transaction-status.enum';
import { FindOptions } from '../../../../../shared/domain/repositories/base.repository.interface';

/**
 * Transaction Repository Implementation using TypeORM
 * Implements the repository pattern for transaction data persistence
 */
@Injectable()
export class TransactionRepository implements ITransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  /**
   * Save a transaction (implements create from base interface)
   */
  async create(
    transaction: Partial<TransactionDomain>,
  ): Promise<TransactionDomain> {
    // For create, we expect a full transaction domain
    const fullTransaction = transaction as TransactionDomain;
    const entity = TransactionMapper.toEntity(fullTransaction);
    const savedEntity = await this.transactionRepository.save(entity);
    return TransactionMapper.toDomain(savedEntity);
  }

  /**
   * Save a transaction
   */
  async save(transaction: TransactionDomain): Promise<TransactionDomain> {
    const entity = TransactionMapper.toEntity(transaction);
    const savedEntity = await this.transactionRepository.save(entity);
    return TransactionMapper.toDomain(savedEntity);
  }

  /**
   * Find a transaction by ID
   */
  async findById(id: string): Promise<TransactionDomain | null> {
    const entity = await this.transactionRepository.findOne({
      where: { id },
    });

    return entity ? TransactionMapper.toDomain(entity) : null;
  }

  /**
   * Find transactions by customer ID
   */
  async findByCustomerId(customerId: string): Promise<TransactionDomain[]> {
    const entities = await this.transactionRepository.find({
      where: { customerId },
      order: { createdAt: 'DESC' },
    });

    return TransactionMapper.toDomainArray(entities);
  }

  /**
   * Find transaction by API transaction ID
   */
  async findByApiId(
    apiTransactionId: string,
  ): Promise<TransactionDomain | null> {
    const entity = await this.transactionRepository.findOne({
      where: { apiTransactionId },
    });

    return entity ? TransactionMapper.toDomain(entity) : null;
  }

  /**
   * Find all transactions with optional filtering
   */
  async findAll(
    options?: FindOptions<TransactionDomain>,
  ): Promise<TransactionDomain[]> {
    const queryOptions: {
      order?: Record<string, 'ASC' | 'DESC'>;
      take?: number;
      skip?: number;
    } = {
      order: { createdAt: 'DESC' },
    };

    if (options?.limit) {
      queryOptions.take = options.limit;
    }
    if (options?.offset) {
      queryOptions.skip = options.offset;
    }
    // Note: For complex domain filtering, we would need to map domain fields to entity fields
    // For now, keeping it simple without where clause from options

    const entities = await this.transactionRepository.find(queryOptions);
    return TransactionMapper.toDomainArray(entities);
  }

  /**
   * Update a transaction
   */
  async update(
    id: string,
    transactionData: Partial<TransactionDomain>,
  ): Promise<TransactionDomain | null> {
    const existingEntity = await this.transactionRepository.findOne({
      where: { id },
    });

    if (!existingEntity) {
      return null;
    }

    // Convert the partial domain to entity updates
    const entityUpdates: Partial<TransactionEntity> = {};

    if (transactionData.customerId) {
      entityUpdates.customerId = transactionData.customerId;
    }
    if (transactionData.deliveryAddressId) {
      entityUpdates.deliveryAddressId = transactionData.deliveryAddressId;
    }
    if (transactionData.subtotal) {
      entityUpdates.subtotal = transactionData.subtotal.amount.toString();
    }
    if (transactionData.baseFee) {
      entityUpdates.baseFee = transactionData.baseFee.amount.toString();
    }
    if (transactionData.deliveryFee) {
      entityUpdates.deliveryFee = transactionData.deliveryFee.amount.toString();
    }
    if (transactionData.totalAmount) {
      entityUpdates.totalAmount = transactionData.totalAmount.amount.toString();
    }
    if (transactionData.status) {
      entityUpdates.status = transactionData.status;
    }
    if (transactionData.apiTransactionId !== undefined) {
      entityUpdates.apiTransactionId = transactionData.apiTransactionId;
    }
    if (transactionData.apiReference !== undefined) {
      entityUpdates.apiReference = transactionData.apiReference;
    }
    if (transactionData.cardType !== undefined) {
      entityUpdates.cardType = transactionData.cardType;
    }
    if (transactionData.cardLastFourDigits !== undefined) {
      entityUpdates.cardLastFourDigits = transactionData.cardLastFourDigits;
    }
    if (transactionData.processedAt !== undefined) {
      entityUpdates.processedAt = transactionData.processedAt;
    }

    entityUpdates.updatedAt = new Date();

    await this.transactionRepository.update(id, entityUpdates);
    const updatedEntity = await this.transactionRepository.findOne({
      where: { id },
    });

    return updatedEntity ? TransactionMapper.toDomain(updatedEntity) : null;
  }

  /**
   * Delete a transaction
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.transactionRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Check if transaction exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.transactionRepository.count({ where: { id } });
    return count > 0;
  }

  /**
   * Count total transactions
   */
  async count(): Promise<number> {
    return await this.transactionRepository.count();
  }

  /**
   * Find transactions by status
   */
  async findByStatus(status: TransactionStatus): Promise<TransactionDomain[]> {
    const entities = await this.transactionRepository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });

    return TransactionMapper.toDomainArray(entities);
  }

  /**
   * Find transactions within date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<TransactionDomain[]> {
    const entities = await this.transactionRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'DESC' },
    });

    return TransactionMapper.toDomainArray(entities);
  }

  /**
   * Find transactions by amount range
   */
  async findByAmountRange(
    minAmount: number,
    maxAmount: number,
  ): Promise<TransactionDomain[]> {
    const entities = await this.transactionRepository.find({
      where: {
        totalAmount: Between(minAmount.toString(), maxAmount.toString()),
      },
      order: { createdAt: 'DESC' },
    });

    return TransactionMapper.toDomainArray(entities);
  }

  /**
   * Update transaction status
   */
  async updateStatus(
    id: string,
    status: TransactionStatus,
  ): Promise<TransactionDomain | null> {
    const existingEntity = await this.transactionRepository.findOne({
      where: { id },
    });

    if (!existingEntity) {
      return null;
    }

    const updateData: Partial<TransactionEntity> = {
      status,
      updatedAt: new Date(),
    };

    // If status is approved, set processedAt
    if (status === TransactionStatus.APPROVED) {
      updateData.processedAt = new Date();
    }

    await this.transactionRepository.update(id, updateData);
    const updatedEntity = await this.transactionRepository.findOne({
      where: { id },
    });

    return updatedEntity ? TransactionMapper.toDomain(updatedEntity) : null;
  }

  /**
   * Find pending transactions older than specified minutes
   */
  async findStaleTransactions(
    minutesAgo: number,
  ): Promise<TransactionDomain[]> {
    const staleDate = new Date();
    staleDate.setMinutes(staleDate.getMinutes() - minutesAgo);

    const entities = await this.transactionRepository.find({
      where: {
        status: TransactionStatus.PENDING,
        createdAt: LessThan(staleDate),
      },
      order: { createdAt: 'ASC' },
    });

    return TransactionMapper.toDomainArray(entities);
  }

  /**
   * Calculate total revenue for date range
   */
  async calculateRevenue(startDate: Date, endDate: Date): Promise<number> {
    const result: { total: string | null } | undefined =
      await this.transactionRepository
        .createQueryBuilder('transaction')
        .select('SUM(CAST(transaction.totalAmount AS DECIMAL))', 'total')
        .where('transaction.status = :status', {
          status: TransactionStatus.APPROVED,
        })
        .andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .getRawOne();

    return Number(result?.total || 0);
  }

  /**
   * Get transaction statistics
   */
  async getStatistics(
    startDate: Date,
    endDate: Date,
  ): Promise<TransactionStatistics> {
    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    // Define types for query results
    type StatusStat = { status: string; count: string };

    // Get total count
    const total = await queryBuilder.getCount();

    // Get status breakdown
    const statusStats = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('transaction.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .groupBy('transaction.status')
      .getRawMany();

    // Get revenue stats for approved transactions
    const revenueStats:
      | { totalRevenue: string | null; averageAmount: string | null }
      | undefined = await this.transactionRepository
      .createQueryBuilder('transaction')
      .select('SUM(CAST(transaction.totalAmount AS DECIMAL))', 'totalRevenue')
      .addSelect(
        'AVG(CAST(transaction.totalAmount AS DECIMAL))',
        'averageAmount',
      )
      .where('transaction.status = :status', {
        status: TransactionStatus.APPROVED,
      })
      .andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getRawOne();

    // Process status stats
    const statusCounts = {
      completed: 0,
      failed: 0,
      pending: 0,
      cancelled: 0,
    };

    statusStats.forEach((stat: StatusStat) => {
      const count = Number(stat.count);
      const status = stat.status as TransactionStatus;
      switch (status) {
        case TransactionStatus.APPROVED:
          statusCounts.completed = count;
          break;
        case TransactionStatus.DECLINED:
          statusCounts.failed = count;
          break;
        case TransactionStatus.PENDING:
          statusCounts.pending = count;
          break;
        case TransactionStatus.CANCELLED:
          statusCounts.cancelled = count;
          break;
      }
    });

    return {
      total,
      ...statusCounts,
      totalRevenue: Number(revenueStats?.totalRevenue || 0),
      averageAmount: Number(revenueStats?.averageAmount || 0),
    };
  }
}
