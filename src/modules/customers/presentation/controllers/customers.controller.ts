import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetCustomersUseCase } from '../../application/use-cases/get-customers.use-case';
import { CreateCustomerUseCase } from '../../application/use-cases/create-customer.use-case';
import { CustomerResponseDto } from '../dto/customer-response.dto';
import { CreateCustomerDto } from '../dto/create-customer.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly getCustomersUseCase: GetCustomersUseCase,
    private readonly createCustomerUseCase: CreateCustomerUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved all customers',
    type: [CustomerResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findAll(): Promise<CustomerResponseDto[]> {
    const customers = await this.getCustomersUseCase.execute();
    return customers.map((customer) => ({
      id: customer.id,
      email: customer.email.address,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: customer.getFullName(),
      phone: customer.phone?.getFormattedNumber() ?? undefined,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Customer created successfully',
    type: CustomerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Customer with this email already exists',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async create(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer =
      await this.createCustomerUseCase.execute(createCustomerDto);

    return {
      id: customer.id,
      email: customer.email.address,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: customer.getFullName(),
      phone: customer.phone?.getFormattedNumber() ?? undefined,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }
}
