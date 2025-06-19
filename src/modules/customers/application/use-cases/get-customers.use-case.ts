import { Injectable, Inject } from '@nestjs/common';
import { CustomerDomain } from '../../domain/entities/customer-domain.entity';
import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../customers.tokens';

/**
 * Get Customers Use Case
 * Handles the business logic for retrieving customers
 */
@Injectable()
export class GetCustomersUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  /**
   * Execute the use case to get all customers
   */
  async execute(): Promise<CustomerDomain[]> {
    return await this.customerRepository.findAll();
  }

  /**
   * Execute the use case to get customers with pagination
   */
  async executeWithPagination(
    limit: number = 10,
    offset: number = 0,
  ): Promise<{
    customers: CustomerDomain[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Get customers with pagination
    const customers = await this.customerRepository.findAll({
      limit,
      offset,
      orderBy: 'createdAt',
      orderDirection: 'DESC',
    });

    // Get total count
    const total = await this.customerRepository.count();

    // Calculate pagination info
    const page = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      customers,
      total,
      page,
      totalPages,
    };
  }
}
