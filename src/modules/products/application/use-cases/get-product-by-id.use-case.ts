import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ProductDomain } from '../../domain/entities/product-domain.entity';
import { PRODUCT_REPOSITORY_TOKEN } from '../../products.tokens';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string): Promise<ProductDomain> {
    // Validate input
    if (!id || typeof id !== 'string') {
      throw new Error('Product ID is required and must be a valid string');
    }

    // Business rule: Product must exist
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new Error(`Product with ID ${id} not found`);
    }

    return product;
  }
}
