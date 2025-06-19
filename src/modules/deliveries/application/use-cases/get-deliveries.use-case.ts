import { Injectable, Inject } from '@nestjs/common';
import { IDeliveryRepository } from '../../domain/repositories/delivery.repository.interface';
import { DeliveryDomain } from '../../domain/entities/delivery-domain.entity';
import { DELIVERY_REPOSITORY_TOKEN } from '../../deliveries.tokens';
import { DeliveryStatus } from '../../../../shared/domain/enums/delivery-status.enum';

export interface GetDeliveriesOptions {
  page?: number;
  limit?: number;
  status?: DeliveryStatus;
  transactionId?: string;
}

export interface GetDeliveriesResult {
  deliveries: DeliveryDomain[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class GetDeliveriesUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY_TOKEN)
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async execute(
    options: GetDeliveriesOptions = {},
  ): Promise<GetDeliveriesResult> {
    const { page = 1, limit = 10, status, transactionId } = options;

    // Validate pagination parameters
    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    let deliveries: DeliveryDomain[];

    // Apply business logic for delivery retrieval
    if (transactionId) {
      // Find delivery by specific transaction
      const delivery =
        await this.deliveryRepository.findByTransactionId(transactionId);
      deliveries = delivery ? [delivery] : [];
    } else if (status) {
      // Filter by status
      const allStatusDeliveries =
        await this.deliveryRepository.findByStatus(status);
      const startIndex = (page - 1) * limit;
      deliveries = allStatusDeliveries.slice(startIndex, startIndex + limit);
    } else {
      // Get all deliveries with pagination
      deliveries = await this.deliveryRepository.findAll({
        limit,
        offset: (page - 1) * limit,
        orderBy: 'createdAt',
        orderDirection: 'DESC',
      });
    }

    // Get total count for pagination
    let totalCount: number;
    if (transactionId) {
      totalCount = deliveries.length;
    } else if (status) {
      // Use count with status filter instead of loading all records
      totalCount = await this.deliveryRepository.count({
        where: { status } as Partial<DeliveryDomain>,
      });
    } else {
      // Use count method instead of loading all records
      totalCount = await this.deliveryRepository.count();
    }

    const totalPages = Math.ceil(totalCount / limit);

    return {
      deliveries,
      total: totalCount,
      page,
      limit,
      totalPages,
    };
  }
}
