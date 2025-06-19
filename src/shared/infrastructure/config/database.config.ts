import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { ProductEntity } from '../../../modules/products/infrastructure/persistence/entities/product.entity';
import { CustomerEntity } from '../../../modules/customers/infrastructure/persistence/entities/customer.entity';
import { TransactionEntity } from '../../../modules/transactions/infrastructure/persistence/entities/transaction.entity';
import { TransactionItemEntity } from '../../../modules/transactions/infrastructure/persistence/entities/transaction-item.entity';
import { DeliveryAddressEntity } from '../../../modules/deliveries/infrastructure/persistence/entities/delivery-address.entity';
import { DeliveryEntity } from '../../../modules/deliveries/infrastructure/persistence/entities/delivery.entity';
import { PaymentEntity } from '../../../modules/payments/infrastructure/persistence/entities/payment.entity';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  return {
    type: 'cockroachdb',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    ssl: {
      rejectUnauthorized: isProduction, // Estricta en producción
    },

    // Configuración de conexión optimizada
    extra: {
      max: configService.get<number>('DB_MAX_OPEN_CONNS', 10), // Reducido
      min: configService.get<number>('DB_MAX_IDLE_CONNS', 2), // Reducido
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      acquireTimeoutMillis: 20000,
      createTimeoutMillis: 10000,
    },
    synchronize: false,
    migrationsRun: false,
    logging: configService.get<string>('NODE_ENV') === 'development',
    entities: [
      ProductEntity,
      CustomerEntity, // Explicitly include CustomerEntity
      TransactionEntity, // Explicitly include TransactionEntity
      TransactionItemEntity, // Explicitly include TransactionItemEntity
      DeliveryAddressEntity, // Explicitly include DeliveryAddressEntity
      DeliveryEntity, // Explicitly include DeliveryEntity
      PaymentEntity, // Explicitly include PaymentEntity
      __dirname +
        '/../../**/infrastructure/persistence/entities/*.entity{.ts,.js}',
      __dirname + '/../../**/*.entity{.ts,.js}', // Fallback for other entities
    ],
    migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
  };
};

export const databaseConfig = {
  provide: 'DATABASE_CONFIG',
  useFactory: (configService: ConfigService) =>
    getDatabaseConfig(configService),
  inject: [ConfigService],
};
