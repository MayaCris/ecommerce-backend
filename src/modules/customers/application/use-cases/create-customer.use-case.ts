import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { CustomerDomain } from '../../domain/entities/customer-domain.entity';
import { Email, PhoneNumber } from '../../../../shared/domain/value-objects';
import { CUSTOMER_REPOSITORY_TOKEN } from '../../customers.tokens';

interface CreateCustomerRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Use case for creating a new customer
 */
@Injectable()
export class CreateCustomerUseCase {
  constructor(
    @Inject(CUSTOMER_REPOSITORY_TOKEN)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  async execute(request: CreateCustomerRequest): Promise<CustomerDomain> {
    // Validate that email is not already taken
    const existingCustomer = await this.customerRepository.findByEmail(
      request.email,
    );

    if (existingCustomer) {
      throw new ConflictException(
        `Customer with email ${request.email} already exists`,
      );
    }

    // Create value objects
    const email = Email.create(request.email);
    const phone = request.phone ? new PhoneNumber(request.phone) : null;

    // Create domain entity
    const customer = CustomerDomain.create({
      id: 'temp-id', // Will be replaced by DB-generated UUID
      email,
      firstName: request.firstName,
      lastName: request.lastName,
      phone,
    });

    // Save to repository
    const savedCustomer = await this.customerRepository.create(customer);

    return savedCustomer;
  }
}
