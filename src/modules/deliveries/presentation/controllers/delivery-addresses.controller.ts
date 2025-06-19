import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { GetAllDeliveryAddressesUseCase } from '../../application/use-cases/get-all-delivery-addresses.use-case';
import { CreateDeliveryAddressUseCase } from '../../application/use-cases/create-delivery-address.use-case';
import { DeliveryAddressResponseDto } from '../dto/delivery-address-response.dto';
import { CreateDeliveryAddressDto } from '../dto/create-delivery-address.dto';

@ApiTags('delivery-addresses')
@Controller('delivery-addresses')
export class DeliveryAddressesController {
  constructor(
    private readonly getAllDeliveryAddressesUseCase: GetAllDeliveryAddressesUseCase,
    private readonly createDeliveryAddressUseCase: CreateDeliveryAddressUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all delivery addresses' })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter by customer ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    description: 'Filter by city',
    example: 'Bogotá',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Maximum number of addresses to return',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of addresses to skip',
    example: 0,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved delivery addresses',
    type: [DeliveryAddressResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findAll(
    @Query('customerId') customerId?: string,
    @Query('city') city?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<DeliveryAddressResponseDto[]> {
    const addresses = await this.getAllDeliveryAddressesUseCase.execute({
      customerId,
      city,
      limit,
      offset,
    });

    return addresses.map((address) => ({
      id: address.id,
      customerId: address.customerId,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      additionalInfo: address.additionalInfo,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
    }));
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new delivery address' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Delivery address created successfully',
    type: DeliveryAddressResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Customer already has a default address',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async create(
    @Body() createDeliveryAddressDto: CreateDeliveryAddressDto,
  ): Promise<DeliveryAddressResponseDto> {
    const address = await this.createDeliveryAddressUseCase.execute({
      customerId: createDeliveryAddressDto.customerId,
      streetAddress: createDeliveryAddressDto.streetAddress,
      city: createDeliveryAddressDto.city,
      state: createDeliveryAddressDto.state,
      postalCode: createDeliveryAddressDto.postalCode,
      country: createDeliveryAddressDto.country,
      additionalInfo: createDeliveryAddressDto.additionalInfo,
      isDefault: createDeliveryAddressDto.isDefault,
    });

    return {
      id: address.id,
      customerId: address.customerId,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      additionalInfo: address.additionalInfo,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
    };
  }
}
