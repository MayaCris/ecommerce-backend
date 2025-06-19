import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { IDeliveryAddressRepository } from '../../domain/repositories/delivery-address.repository.interface';
import { DeliveryAddressDomain } from '../../domain/entities/delivery-address-domain.entity';
import { DELIVERY_ADDRESS_REPOSITORY_TOKEN } from '../../deliveries.tokens';

export interface CreateDeliveryAddressRequest {
  customerId: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  additionalInfo?: string;
  isDefault?: boolean;
}

/**
 * Use case for creating a new delivery address
 */
@Injectable()
export class CreateDeliveryAddressUseCase {
  constructor(
    @Inject(DELIVERY_ADDRESS_REPOSITORY_TOKEN)
    private readonly deliveryAddressRepository: IDeliveryAddressRepository,
  ) {}

  async execute(
    request: CreateDeliveryAddressRequest,
  ): Promise<DeliveryAddressDomain> {
    // If this address should be default, check if customer already has a default address
    if (request.isDefault) {
      const existingDefault =
        await this.deliveryAddressRepository.findDefaultByCustomerId(
          request.customerId,
        );

      if (existingDefault) {
        throw new ConflictException(
          `Customer already has a default address. Please update the existing default address first.`,
        );
      }
    }

    // If customer doesn't have any addresses, make this one default
    const existingAddresses =
      await this.deliveryAddressRepository.findByCustomerId(request.customerId);

    const shouldBeDefault = request.isDefault || existingAddresses.length === 0;

    // Create the delivery address entity
    const deliveryAddressData: Partial<DeliveryAddressDomain> = {
      customerId: request.customerId,
      streetAddress: request.streetAddress,
      city: request.city,
      state: request.state,
      postalCode: request.postalCode,
      country: request.country || 'Colombia',
      additionalInfo: request.additionalInfo,
      isDefault: shouldBeDefault,
    };

    // Save to repository
    const savedAddress =
      await this.deliveryAddressRepository.create(deliveryAddressData);

    return savedAddress;
  }
}
