import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ProductDomain } from '../../domain/entities/product-domain.entity';
import { Money, SKU, Quantity } from '../../../../shared/domain/value-objects';
import { PRODUCT_REPOSITORY_TOKEN } from '../../products.tokens';
import { v4 as uuidv4 } from 'uuid';

export interface CreateProductDto {
  name: string;
  description: string;
  price: {
    amount: number;
    currency: string;
  };
  stock: {
    value: number;
  };
  sku: {
    value: string;
  };
  imageUrl: string;
  isActive: boolean;
}

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
  ) {}
  async execute(dto: CreateProductDto): Promise<ProductDomain> {
    // Create Value Objects
    const money = new Money(dto.price.amount, dto.price.currency);
    const sku = new SKU(dto.sku.value);
    const quantity = new Quantity(dto.stock.value);

    // Create domain entity
    const product = ProductDomain.create({
      id: uuidv4(), // Generate new UUID
      name: dto.name,
      description: dto.description,
      price: money,
      stock: quantity,
      sku: sku,
      imageUrl: dto.imageUrl,
      isActive: dto.isActive,
    });

    // Save to repository
    return await this.productRepository.create(product);
  }
}
