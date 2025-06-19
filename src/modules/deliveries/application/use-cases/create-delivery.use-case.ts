import { Injectable, Inject } from '@nestjs/common';
import { IDeliveryRepository } from '../../domain/repositories/delivery.repository.interface';
import { DeliveryDomain } from '../../domain/entities/delivery-domain.entity';
import { DELIVERY_REPOSITORY_TOKEN } from '../../deliveries.tokens';
import { DeliveryStatus } from '../../../../shared/domain/enums/delivery-status.enum';
import { v4 as uuidv4 } from 'uuid';

export interface CreateDeliveryDto {
  transactionId: string;
  deliveryAddressId: string;
  trackingNumber?: string;
  carrier?: string;
  status?: DeliveryStatus;
  estimatedDeliveryDate?: Date;
  deliveryNotes?: string;
}

@Injectable()
export class CreateDeliveryUseCase {
  constructor(
    @Inject(DELIVERY_REPOSITORY_TOKEN)
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  async execute(dto: CreateDeliveryDto): Promise<DeliveryDomain> {
    // Validate that transaction doesn't already have a delivery
    const existingDelivery = await this.deliveryRepository.findByTransactionId(
      dto.transactionId,
    );
    if (existingDelivery) {
      throw new Error(
        `Delivery already exists for transaction ${dto.transactionId}`,
      );
    }

    // Create delivery entity
    const deliveryData: Partial<DeliveryDomain> = {
      id: uuidv4(),
      transactionId: dto.transactionId,
      deliveryAddressId: dto.deliveryAddressId,
      trackingNumber: dto.trackingNumber || null,
      carrier: dto.carrier || null,
      status: dto.status || DeliveryStatus.PENDING,
      estimatedDeliveryDate: dto.estimatedDeliveryDate || null,
      deliveryNotes: dto.deliveryNotes || null,
    };

    // Save to repository
    return await this.deliveryRepository.create(deliveryData);
  }
}
