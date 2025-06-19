import { Injectable, Inject } from '@nestjs/common';
import { IDeliveryAddressRepository } from '../../domain/repositories/delivery-address.repository.interface';
import { DeliveryAddressDomain } from '../../domain/entities/delivery-address-domain.entity';
import { DELIVERY_ADDRESS_REPOSITORY_TOKEN } from '../../deliveries.tokens';

export interface GetAllDeliveryAddressesRequest {
  customerId?: string;
  city?: string;
  limit?: number;
  offset?: number;
}

/**
 * Use case for retrieving all delivery addresses with optional filtering
 */
@Injectable()
export class GetAllDeliveryAddressesUseCase {
  constructor(
    @Inject(DELIVERY_ADDRESS_REPOSITORY_TOKEN)
    private readonly deliveryAddressRepository: IDeliveryAddressRepository,
  ) {}

  async execute(
    request?: GetAllDeliveryAddressesRequest,
  ): Promise<DeliveryAddressDomain[]> {
    // Build filter options based on the request
    const whereConditions: Record<string, any> = {};

    if (request?.customerId) {
      whereConditions.customerId = request.customerId;
    }

    if (request?.city) {
      whereConditions.city = request.city;
    }

    const options = {
      where:
        Object.keys(whereConditions).length > 0 ? whereConditions : undefined,
      limit: request?.limit,
      offset: request?.offset,
      orderBy: 'createdAt' as keyof DeliveryAddressDomain,
      orderDirection: 'DESC' as const,
    };

    return await this.deliveryAddressRepository.findAll(options);
  }
}
