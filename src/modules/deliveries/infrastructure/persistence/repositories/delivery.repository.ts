import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DeliveryEntity } from '../entities/delivery.entity';
import { DeliveryDomain } from '../../../domain/entities/delivery-domain.entity';
import { DeliveryMapper } from '../../adapters/delivery.mapper';
import {
  IDeliveryRepository,
  DeliveryStatistics,
} from '../../../domain/repositories/delivery.repository.interface';
import { DeliveryStatus } from '../../../../../shared/domain/enums/delivery-status.enum';
import { FindOptions } from '../../../../../shared/domain/repositories/base.repository.interface';

@Injectable()
export class DeliveryRepository implements IDeliveryRepository {
  constructor(
    @InjectRepository(DeliveryEntity)
    private readonly repository: Repository<DeliveryEntity>,
  ) {}

  async findById(id: string): Promise<DeliveryDomain | null> {
    const entity = await this.repository.findOne({
      where: { id },
    });

    return entity ? DeliveryMapper.toDomain(entity) : null;
  }
  async findAll(
    options?: FindOptions<DeliveryDomain>,
  ): Promise<DeliveryDomain[]> {
    const queryBuilder = this.repository.createQueryBuilder('delivery');

    if (options?.where) {
      // Map domain filters to entity filters with proper business logic
      const domainWhere = options.where;

      if (domainWhere.transactionId) {
        queryBuilder.andWhere('delivery.transactionId = :transactionId', {
          transactionId: domainWhere.transactionId,
        });
      }

      if (domainWhere.deliveryAddressId) {
        queryBuilder.andWhere(
          'delivery.deliveryAddressId = :deliveryAddressId',
          {
            deliveryAddressId: domainWhere.deliveryAddressId,
          },
        );
      }

      if (domainWhere.status) {
        queryBuilder.andWhere('delivery.status = :status', {
          status: domainWhere.status,
        });
      }

      if (domainWhere.carrier) {
        queryBuilder.andWhere('delivery.carrier = :carrier', {
          carrier: domainWhere.carrier,
        });
      }

      if (domainWhere.trackingNumber) {
        queryBuilder.andWhere('delivery.trackingNumber = :trackingNumber', {
          trackingNumber: domainWhere.trackingNumber,
        });
      }
    }

    if (options?.orderBy) {
      const direction = options.orderDirection || 'ASC';
      queryBuilder.orderBy(`delivery.${String(options.orderBy)}`, direction);
    } else {
      queryBuilder.orderBy('delivery.createdAt', 'DESC');
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    const entities = await queryBuilder.getMany();
    return DeliveryMapper.toDomainArray(entities);
  }

  async create(entity: Partial<DeliveryDomain>): Promise<DeliveryDomain> {
    const entityData = this.repository.create(entity);
    const savedEntity = await this.repository.save(entityData);
    return DeliveryMapper.toDomain(savedEntity);
  }

  async update(
    id: string,
    updates: Partial<DeliveryDomain>,
  ): Promise<DeliveryDomain | null> {
    await this.repository.update(id, updates);
    return await this.findById(id);
  }
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<DeliveryDomain | null> {
    const entity = await this.repository.findOne({
      where: { transactionId },
    });

    return entity ? DeliveryMapper.toDomain(entity) : null;
  }

  async findByStatus(status: DeliveryStatus): Promise<DeliveryDomain[]> {
    const entities = await this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });

    return DeliveryMapper.toDomainArray(entities);
  }

  async findByAddress(address: string): Promise<DeliveryDomain[]> {
    const entities = await this.repository
      .createQueryBuilder('delivery')
      .where(
        'delivery.deliveryAddressId IN (SELECT id FROM delivery_addresses WHERE street_address ILIKE :address)',
        {
          address: `%${address}%`,
        },
      )
      .orderBy('delivery.createdAt', 'DESC')
      .getMany();

    return DeliveryMapper.toDomainArray(entities);
  }

  async findScheduledForToday(): Promise<DeliveryDomain[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entities = await this.repository.find({
      where: {
        estimatedDeliveryDate: Between(today, tomorrow),
        status: DeliveryStatus.SHIPPED,
      },
      order: { estimatedDeliveryDate: 'ASC' },
    });

    return DeliveryMapper.toDomainArray(entities);
  }

  async findOverdue(): Promise<DeliveryDomain[]> {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const entities = await this.repository
      .createQueryBuilder('delivery')
      .where('delivery.estimatedDeliveryDate < :today', { today })
      .andWhere('delivery.status NOT IN (:...completedStatuses)', {
        completedStatuses: [DeliveryStatus.DELIVERED, DeliveryStatus.CANCELLED],
      })
      .orderBy('delivery.estimatedDeliveryDate', 'ASC')
      .getMany();

    return DeliveryMapper.toDomainArray(entities);
  }

  async updateStatus(
    id: string,
    status: DeliveryStatus,
  ): Promise<DeliveryDomain | null> {
    // Find the existing entity first
    const existingEntity = await this.repository.findOne({ where: { id } });
    if (!existingEntity) {
      return null;
    }

    // Create update object for entity
    const updateData: Partial<DeliveryEntity> = { status };

    // Set timestamps based on status using business logic
    if (status === DeliveryStatus.SHIPPED && !existingEntity.shippedAt) {
      updateData.shippedAt = new Date();
    } else if (
      status === DeliveryStatus.DELIVERED &&
      !existingEntity.deliveredAt
    ) {
      updateData.deliveredAt = new Date();
    }

    // Update the entity
    await this.repository.update(id, updateData);

    // Fetch and return the updated entity as domain
    const updatedEntity = await this.repository.findOne({ where: { id } });
    return updatedEntity ? DeliveryMapper.toDomain(updatedEntity) : null;
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<DeliveryDomain[]> {
    const entities = await this.repository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'DESC' },
    });

    return DeliveryMapper.toDomainArray(entities);
  }

  async getDeliveryStatistics(
    startDate: Date,
    endDate: Date,
  ): Promise<DeliveryStatistics> {
    const deliveries = await this.findByDateRange(startDate, endDate);

    const total = deliveries.length;
    const pending = deliveries.filter(
      (d) => d.status === DeliveryStatus.PENDING,
    ).length;
    const inTransit = deliveries.filter(
      (d) => d.status === DeliveryStatus.SHIPPED,
    ).length;
    const delivered = deliveries.filter(
      (d) => d.status === DeliveryStatus.DELIVERED,
    ).length;
    const returned = deliveries.filter(
      (d) => d.status === DeliveryStatus.CANCELLED,
    ).length; // Calculate average delivery time for delivered orders
    const deliveredOrders = deliveries.filter(
      (d) =>
        d.status === DeliveryStatus.DELIVERED && d.shippedAt && d.deliveredAt,
    );

    let averageDeliveryTime = 0;
    if (deliveredOrders.length > 0) {
      const totalDeliveryTime = deliveredOrders.reduce((sum, delivery) => {
        if (delivery.deliveredAt && delivery.shippedAt) {
          const deliveryTime =
            delivery.deliveredAt.getTime() - delivery.shippedAt.getTime();
          return sum + deliveryTime;
        }
        return sum;
      }, 0);
      averageDeliveryTime =
        totalDeliveryTime / deliveredOrders.length / (1000 * 60 * 60); // Convert to hours
    }

    return {
      total,
      pending,
      inTransit,
      delivered,
      returned,
      averageDeliveryTime,
    };
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }
  async count(options?: FindOptions<DeliveryDomain>): Promise<number> {
    const queryBuilder = this.repository.createQueryBuilder('delivery');

    if (options?.where) {
      const entityWhere = options.where;
      queryBuilder.where(entityWhere);
    }

    return await queryBuilder.getCount();
  }
}
