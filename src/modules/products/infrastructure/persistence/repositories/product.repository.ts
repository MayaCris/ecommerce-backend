import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { ProductDomain } from '../../../domain/entities/product-domain.entity';
import {
  IProductRepository,
  ProductSearchOptions,
} from '../../../domain/repositories/product.repository.interface';
import { ProductEntity } from '../entities/product.entity';
import { ProductMapper } from '../mappers/product.mapper';
import {
  SKU,
  Money,
  Quantity,
} from '../../../../../shared/domain/value-objects';
import { FindOptions } from '../../../../../shared/domain/repositories/base.repository.interface';

/**
 * Product Repository Implementation using TypeORM
 * Handles conversion between domain entities and persistence entities
 */
@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productEntityRepository: Repository<ProductEntity>,
  ) {}

  /**
   * Find all products with optional filtering
   */
  async findAll(
    options?: FindOptions<ProductDomain>,
  ): Promise<ProductDomain[]> {
    const queryBuilder =
      this.productEntityRepository.createQueryBuilder('product');

    if (options?.where) {
      // Convert domain filters to entity filters
      const entityWhere: Record<string, unknown> =
        this.convertDomainToEntityFilters(options.where);
      queryBuilder.where(entityWhere);
    }

    if (options?.orderBy) {
      const direction = options.orderDirection || 'ASC';
      queryBuilder.orderBy(`product.${String(options.orderBy)}`, direction);
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    const entities = await queryBuilder.getMany();
    return ProductMapper.toDomainArray(entities);
  }

  /**
   * Find product by ID
   */
  async findById(id: string): Promise<ProductDomain | null> {
    const entity = await this.productEntityRepository.findOne({
      where: { id },
    });
    return entity ? ProductMapper.toDomain(entity) : null;
  }

  /**
   * Create new product
   */
  async create(domain: ProductDomain): Promise<ProductDomain> {
    const entity = ProductMapper.createEntity(domain);
    const savedEntity = await this.productEntityRepository.save(entity);
    return ProductMapper.toDomain(savedEntity);
  }

  /**
   * Update existing product
   */
  async update(
    id: string,
    domain: ProductDomain,
  ): Promise<ProductDomain | null> {
    const existingEntity = await this.productEntityRepository.findOne({
      where: { id },
    });
    if (!existingEntity) {
      return null;
    }

    const updatedEntity = ProductMapper.updateEntity(existingEntity, domain);
    const savedEntity = await this.productEntityRepository.save(updatedEntity);
    return ProductMapper.toDomain(savedEntity);
  }

  /**
   * Delete product by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.productEntityRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Check if product exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.productEntityRepository.count({ where: { id } });
    return count > 0;
  }

  /**
   * Count total products with optional filtering
   */
  async count(options?: FindOptions<ProductDomain>): Promise<number> {
    const queryBuilder =
      this.productEntityRepository.createQueryBuilder('product');

    if (options?.where) {
      const entityWhere = this.convertDomainToEntityFilters(options.where);
      queryBuilder.where(entityWhere);
    }

    return await queryBuilder.getCount();
  }

  /**
   * Find products by name (case-insensitive search)
   */
  async findByName(name: string): Promise<ProductDomain[]> {
    const entities = await this.productEntityRepository.find({
      where: { name: Like(`%${name}%`) },
    });
    return ProductMapper.toDomainArray(entities);
  }

  /**
   * Find products by SKU
   */
  async findBySku(sku: SKU): Promise<ProductDomain | null> {
    const entity = await this.productEntityRepository.findOne({
      where: { sku: sku.code },
    });
    return entity ? ProductMapper.toDomain(entity) : null;
  }

  /**
   * Find all active products
   */
  async findActive(): Promise<ProductDomain[]> {
    const entities = await this.productEntityRepository.find({
      where: { isActive: true },
    });
    return ProductMapper.toDomainArray(entities);
  }

  /**
   * Find products with stock greater than specified amount
   */
  async findWithStock(minStock?: Quantity): Promise<ProductDomain[]> {
    const stockAmount = minStock ? minStock.amount : 0;
    const entities = await this.productEntityRepository
      .createQueryBuilder('product')
      .where('product.stockQuantity > :stockAmount', { stockAmount })
      .getMany();
    return ProductMapper.toDomainArray(entities);
  }

  /**
   * Find products within price range
   */
  async findByPriceRange(
    minPrice: Money,
    maxPrice: Money,
  ): Promise<ProductDomain[]> {
    // Since we're using USD as default currency, we only check amounts
    const entities = await this.productEntityRepository.find({
      where: {
        price: Between(minPrice.amount, maxPrice.amount),
      },
    });
    return ProductMapper.toDomainArray(entities);
  }

  /**
   * Search products by text with options
   */
  async search(
    query: string,
    options?: ProductSearchOptions,
  ): Promise<ProductDomain[]> {
    const queryBuilder =
      this.productEntityRepository.createQueryBuilder('product');

    // Text search in name and description
    if (query) {
      queryBuilder.where(
        '(LOWER(product.name) LIKE LOWER(:query) OR LOWER(product.description) LIKE LOWER(:query))',
        { query: `%${query}%` },
      );
    }

    // Filter options
    if (options) {
      if (!options.includeInactive) {
        queryBuilder.andWhere('product.isActive = :isActive', {
          isActive: true,
        });
      }

      if (options.minStock !== undefined) {
        queryBuilder.andWhere('product.stockQuantity >= :minStock', {
          minStock: options.minStock,
        });
      }

      // Sorting
      if (options.sortBy) {
        const direction = options.sortOrder || 'ASC';
        const columnMap = {
          name: 'product.name',
          price: 'product.price',
          stock: 'product.stockQuantity',
          created_at: 'product.createdAt',
        };
        queryBuilder.orderBy(columnMap[options.sortBy], direction);
      }

      // Pagination
      if (options.limit) {
        queryBuilder.limit(options.limit);
      }
      if (options.offset) {
        queryBuilder.offset(options.offset);
      }
    }

    const entities = await queryBuilder.getMany();
    return ProductMapper.toDomainArray(entities);
  }

  /**
   * Update stock quantity for a product
   */
  async updateStock(
    id: string,
    newQuantity: Quantity,
  ): Promise<ProductDomain | null> {
    const entity = await this.productEntityRepository.findOne({
      where: { id },
    });
    if (!entity) {
      return null;
    }

    entity.stockQuantity = newQuantity.amount;
    entity.updatedAt = new Date();

    const savedEntity = await this.productEntityRepository.save(entity);
    return ProductMapper.toDomain(savedEntity);
  }

  /**
   * Reduce stock quantity (for sales)
   */
  async reduceStock(
    id: string,
    quantity: Quantity,
  ): Promise<ProductDomain | null> {
    const entity = await this.productEntityRepository.findOne({
      where: { id },
    });
    if (!entity) {
      return null;
    }

    const currentStock = new Quantity(entity.stockQuantity);
    const newStock = currentStock.subtract(quantity);

    entity.stockQuantity = newStock.amount;
    entity.updatedAt = new Date();

    const savedEntity = await this.productEntityRepository.save(entity);
    return ProductMapper.toDomain(savedEntity);
  }

  /**
   * Check if product has sufficient stock
   */
  async hasStock(id: string, requiredQuantity: Quantity): Promise<boolean> {
    const entity = await this.productEntityRepository.findOne({
      where: { id },
      select: ['stockQuantity'],
    });

    if (!entity) {
      return false;
    }

    const currentStock = new Quantity(entity.stockQuantity);
    return currentStock.isSufficient(requiredQuantity);
  }

  /**
   * Helper method to convert domain filters to entity filters
   */
  private convertDomainToEntityFilters(
    domainWhere: Partial<ProductDomain>,
  ): Record<string, unknown> {
    const entityWhere: Record<string, unknown> = {};

    Object.keys(domainWhere).forEach((key) => {
      const value = domainWhere[key as keyof ProductDomain];

      switch (key) {
        case 'price':
          if (value instanceof Money) {
            entityWhere.price = value.amount;
          }
          break;
        case 'stock':
          if (value instanceof Quantity) {
            entityWhere.stockQuantity = value.amount;
          }
          break;
        case 'sku':
          if (value instanceof SKU) {
            entityWhere.sku = value.code;
          }
          break;
        default:
          entityWhere[key] = value;
      }
    });

    return entityWhere;
  }
}
