import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CustomerDomain } from '../../../domain/entities/customer-domain.entity';
import { ICustomerRepository } from '../../../domain/repositories/customer.repository.interface';
import { CustomerEntity } from '../entities/customer.entity';
import { CustomerMapper } from '../mappers/customer.mapper';
import { FindOptions } from '../../../../../shared/domain/repositories/base.repository.interface';

/**
 * Customer Repository Implementation using TypeORM
 * Handles conversion between domain entities and persistence entities
 */
@Injectable()
export class CustomerRepository implements ICustomerRepository {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerEntityRepository: Repository<CustomerEntity>,
  ) {}

  /**
   * Find all customers with optional filtering
   */
  async findAll(
    options?: FindOptions<CustomerDomain>,
  ): Promise<CustomerDomain[]> {
    const queryBuilder =
      this.customerEntityRepository.createQueryBuilder('customer');

    if (options?.where) {
      // Convert domain filters to entity filters
      const entityWhere: Record<string, unknown> =
        this.convertDomainToEntityFilters(options.where);
      queryBuilder.where(entityWhere);
    }

    if (options?.orderBy) {
      const direction = options.orderDirection || 'ASC';
      queryBuilder.orderBy(`customer.${String(options.orderBy)}`, direction);
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    const entities = await queryBuilder.getMany();
    return CustomerMapper.toDomainArray(entities);
  }

  /**
   * Find customer by ID
   */
  async findById(id: string): Promise<CustomerDomain | null> {
    const entity = await this.customerEntityRepository.findOne({
      where: { id },
    });
    return entity ? CustomerMapper.toDomain(entity) : null;
  }

  /**
   * Create new customer
   */
  async create(domain: CustomerDomain): Promise<CustomerDomain> {
    const entity = CustomerMapper.createEntity(domain);
    const savedEntity = await this.customerEntityRepository.save(entity);
    return CustomerMapper.toDomain(savedEntity);
  }

  /**
   * Update existing customer
   */
  async update(
    id: string,
    domain: CustomerDomain,
  ): Promise<CustomerDomain | null> {
    const existingEntity = await this.customerEntityRepository.findOne({
      where: { id },
    });
    if (!existingEntity) {
      return null;
    }

    const updatedEntity = CustomerMapper.updateEntity(existingEntity, domain);
    const savedEntity = await this.customerEntityRepository.save(updatedEntity);
    return CustomerMapper.toDomain(savedEntity);
  }

  /**
   * Delete customer by ID
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.customerEntityRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Check if customer exists
   */
  async exists(id: string): Promise<boolean> {
    const count = await this.customerEntityRepository.count({ where: { id } });
    return count > 0;
  }

  /**
   * Count total customers with optional filtering
   */
  async count(options?: FindOptions<CustomerDomain>): Promise<number> {
    const queryBuilder =
      this.customerEntityRepository.createQueryBuilder('customer');

    if (options?.where) {
      const entityWhere = this.convertDomainToEntityFilters(options.where);
      queryBuilder.where(entityWhere);
    }

    return await queryBuilder.getCount();
  }

  /**
   * Find customer by email (unique)
   */
  async findByEmail(email: string): Promise<CustomerDomain | null> {
    const entity = await this.customerEntityRepository.findOne({
      where: { email: email.toLowerCase() },
    });
    return entity ? CustomerMapper.toDomain(entity) : null;
  }

  /**
   * Find customer by phone number
   */
  async findByPhone(phone: string): Promise<CustomerDomain | null> {
    const entity = await this.customerEntityRepository.findOne({
      where: { phone },
    });
    return entity ? CustomerMapper.toDomain(entity) : null;
  }

  /**
   * Find customers by name (partial match)
   */
  async findByName(name: string): Promise<CustomerDomain[]> {
    const entities = await this.customerEntityRepository
      .createQueryBuilder('customer')
      .where(
        'LOWER(customer.firstName) LIKE LOWER(:name) OR LOWER(customer.lastName) LIKE LOWER(:name)',
        { name: `%${name}%` },
      )
      .getMany();

    return CustomerMapper.toDomainArray(entities);
  }

  /**
   * Find customers created within date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<CustomerDomain[]> {
    const entities = await this.customerEntityRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      order: {
        createdAt: 'DESC',
      },
    });
    return CustomerMapper.toDomainArray(entities);
  }

  /**
   * Check if email is already registered
   */
  async isEmailTaken(email: string): Promise<boolean> {
    const count = await this.customerEntityRepository.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }

  /**
   * Update customer last activity timestamp
   */
  async updateLastActivity(id: string): Promise<void> {
    await this.customerEntityRepository.update(id, {
      updatedAt: new Date(),
    });
  }

  /**
   * Find customers with recent activity
   */
  async findActiveCustomers(daysAgo: number): Promise<CustomerDomain[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    const entities = await this.customerEntityRepository
      .createQueryBuilder('customer')
      .where('customer.updatedAt >= :cutoffDate', { cutoffDate })
      .orderBy('customer.updatedAt', 'DESC')
      .getMany();

    return CustomerMapper.toDomainArray(entities);
  }

  /**
   * Helper method to convert domain filters to entity filters
   */
  private convertDomainToEntityFilters(
    domainWhere: Partial<CustomerDomain>,
  ): Record<string, unknown> {
    const entityWhere: Record<string, unknown> = {};

    Object.keys(domainWhere).forEach((key) => {
      const value = domainWhere[key as keyof CustomerDomain];

      switch (key) {
        case 'email':
          if (value && typeof value === 'object' && 'address' in value) {
            entityWhere.email = value.address;
          }
          break;
        case 'phone':
          if (value && typeof value === 'object' && 'getNumber' in value) {
            entityWhere.phone = value.getNumber();
          }
          break;
        default:
          entityWhere[key] = value;
      }
    });

    return entityWhere;
  }
}
