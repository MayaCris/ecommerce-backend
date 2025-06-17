import { Module } from '@nestjs/common';
import { ProductsController } from './presentation/controllers/products.controller';

@Module({
  controllers: [ProductsController],
  providers: [],
  exports: [],
})
export class ProductsModule {}
