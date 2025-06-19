import { Injectable, Inject } from '@nestjs/common';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ProductDomain } from '../../domain/entities/product-domain.entity';
import { PRODUCT_REPOSITORY_TOKEN } from '../../products.tokens';

export interface GetProductsOptions {
  page?: number;
  limit?: number;
  search?: string;
  includeInactive?: boolean;
}

export interface GetProductsResult {
  products: ProductDomain[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(options: GetProductsOptions = {}): Promise<GetProductsResult> {
    const { page = 1, limit = 10, search, includeInactive = false } = options;

    // Validate pagination parameters
    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    let products: ProductDomain[];

    // Apply business logic for product retrieval
    if (search) {
      // Search products by name or description
      const searchOptions = {
        includeInactive,
        limit,
        offset: (page - 1) * limit,
        sortBy: 'name' as const,
        sortOrder: 'ASC' as const,
      };
      products = await this.productRepository.search(search, searchOptions);
    } else if (includeInactive) {
      // Get all products including inactive ones
      const findOptions = {
        limit,
        offset: (page - 1) * limit,
        orderBy: 'name' as const,
        orderDirection: 'ASC' as const,
      };
      products = await this.productRepository.findAll(findOptions);
    } else {
      // Business rule: Only show active products with stock by default
      products = await this.productRepository.findActive();

      // Apply pagination manually for active products
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      products = products.slice(startIndex, endIndex);
    }

    // Get total count for pagination
    const total = await this.productRepository.count(
      includeInactive ? {} : { where: { isActive: true } },
    );

    const totalPages = Math.ceil(total / limit);

    return {
      products,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
