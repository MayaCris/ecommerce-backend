import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsController } from './presentation/controllers/products.controller';
import { ProductEntity } from './infrastructure/persistence/entities/product.entity';
import { ProductRepository } from './infrastructure/persistence/repositories/product.repository';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';
import { GetProductsUseCase } from './application/use-cases/get-products.use-case';
import { PRODUCT_REPOSITORY_TOKEN } from './products.tokens';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductsController],
  providers: [
    // Repository implementation with interface token
    {
      provide: PRODUCT_REPOSITORY_TOKEN,
      useClass: ProductRepository,
    },
    // Use cases
    CreateProductUseCase,
    GetProductsUseCase,
  ],
  exports: [PRODUCT_REPOSITORY_TOKEN],
})
export class ProductsModule {}
