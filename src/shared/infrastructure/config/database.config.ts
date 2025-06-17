import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    ssl:
      configService.get<string>('DB_SSL_MODE') === 'verify-full'
        ? { rejectUnauthorized: false }
        : false,
    synchronize: false,
    migrationsRun: false,
    logging: configService.get<string>('NODE_ENV') === 'development',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../../migrations/*{.ts,.js}'],
    extra: {
      max: configService.get<number>('DB_MAX_OPEN_CONNS', 25),
      min: configService.get<number>('DB_MAX_IDLE_CONNS', 5),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  };
};

export const databaseConfig = {
  provide: 'DATABASE_CONFIG',
  useFactory: (configService: ConfigService) =>
    getDatabaseConfig(configService),
  inject: [ConfigService],
};
