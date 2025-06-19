import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryAddressEntity } from './infrastructure/persistence/entities/delivery-address.entity';
import { DeliveryEntity } from './infrastructure/persistence/entities/delivery.entity';
import { DeliveryAddressRepository } from './infrastructure/persistence/repositories/delivery-address.repository';
import { DeliveryRepository } from './infrastructure/persistence/repositories/delivery.repository';
import {
  DELIVERY_ADDRESS_REPOSITORY_TOKEN,
  DELIVERY_REPOSITORY_TOKEN,
} from './deliveries.tokens';
import { GetAllDeliveryAddressesUseCase } from './application/use-cases/get-all-delivery-addresses.use-case';
import { CreateDeliveryAddressUseCase } from './application/use-cases/create-delivery-address.use-case';
import { GetDeliveriesUseCase } from './application/use-cases/get-deliveries.use-case';
import { CreateDeliveryUseCase } from './application/use-cases/create-delivery.use-case';
import { DeliveryAddressesController } from './presentation/controllers/delivery-addresses.controller';
import { DeliveriesController } from './presentation/controllers/deliveries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryAddressEntity, DeliveryEntity])],
  controllers: [DeliveryAddressesController, DeliveriesController],
  providers: [
    // Repository implementations with interface tokens
    {
      provide: DELIVERY_ADDRESS_REPOSITORY_TOKEN,
      useClass: DeliveryAddressRepository,
    },
    {
      provide: DELIVERY_REPOSITORY_TOKEN,
      useClass: DeliveryRepository,
    },
    // Use cases
    GetAllDeliveryAddressesUseCase,
    CreateDeliveryAddressUseCase,
    GetDeliveriesUseCase,
    CreateDeliveryUseCase,
  ],
  exports: [DELIVERY_ADDRESS_REPOSITORY_TOKEN, DELIVERY_REPOSITORY_TOKEN],
})
export class DeliveriesModule {}
