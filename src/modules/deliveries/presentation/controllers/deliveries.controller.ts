import { Controller, Get, Post, Body, Query, Inject } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { DeliveryResponseDto } from '../dto/delivery-response.dto';
import { CreateDeliveryRequestDto } from '../dto/create-delivery-request.dto';
import { ApiResponseDto } from '../../../../shared/application/dto/api-response.dto';
import {
  CreateDeliveryUseCase,
  CreateDeliveryDto,
} from '../../application/use-cases/create-delivery.use-case';
import {
  GetDeliveriesUseCase,
  GetDeliveriesOptions,
} from '../../application/use-cases/get-deliveries.use-case';
import { IDeliveryRepository } from '../../domain/repositories/delivery.repository.interface';
import { DELIVERY_REPOSITORY_TOKEN } from '../../deliveries.tokens';
import { DeliveryStatus } from '../../../../shared/domain/enums/delivery-status.enum';

@ApiTags('Deliveries')
@Controller('deliveries')
export class DeliveriesController {
  constructor(
    private readonly createDeliveryUseCase: CreateDeliveryUseCase,
    private readonly getDeliveriesUseCase: GetDeliveriesUseCase,
    @Inject(DELIVERY_REPOSITORY_TOKEN)
    private readonly deliveryRepository: IDeliveryRepository,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new delivery',
    description: 'Creates a new delivery record for a transaction',
  })
  @ApiBody({ type: CreateDeliveryRequestDto })
  @ApiResponse({
    status: 201,
    description: 'Delivery created successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'Delivery already exists for this transaction',
  })
  async create(
    @Body() createDeliveryDto: CreateDeliveryRequestDto,
  ): Promise<ApiResponseDto<DeliveryResponseDto>> {
    try {
      const createDto: CreateDeliveryDto = {
        transactionId: createDeliveryDto.transactionId,
        deliveryAddressId: createDeliveryDto.deliveryAddressId,
        trackingNumber: createDeliveryDto.trackingNumber,
        carrier: createDeliveryDto.carrier,
        status: createDeliveryDto.status,
        estimatedDeliveryDate: createDeliveryDto.estimatedDeliveryDate
          ? new Date(createDeliveryDto.estimatedDeliveryDate)
          : undefined,
        deliveryNotes: createDeliveryDto.deliveryNotes,
      };

      const delivery = await this.createDeliveryUseCase.execute(createDto);

      const responseDto: DeliveryResponseDto = {
        id: delivery.id,
        transactionId: delivery.transactionId,
        deliveryAddressId: delivery.deliveryAddressId,
        trackingNumber: delivery.trackingNumber,
        carrier: delivery.carrier,
        status: delivery.status,
        estimatedDeliveryDate:
          delivery.estimatedDeliveryDate?.toISOString().split('T')[0] || null,
        shippedAt: delivery.shippedAt?.toISOString() || null,
        deliveredAt: delivery.deliveredAt?.toISOString() || null,
        deliveryNotes: delivery.deliveryNotes,
        createdAt: delivery.createdAt.toISOString(),
        updatedAt: delivery.updatedAt.toISOString(),
      };
      return {
        success: true,
        message: 'Delivery created successfully',
        data: responseDto,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Failed to create delivery',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get()
  @ApiOperation({
    summary: 'Get all deliveries',
    description:
      'Retrieve all deliveries with optional filtering and pagination',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: DeliveryStatus,
    description: 'Filter by delivery status',
  })
  @ApiQuery({
    name: 'transactionId',
    required: false,
    type: String,
    description: 'Filter by transaction ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Deliveries retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid query parameters',
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: DeliveryStatus,
    @Query('transactionId') transactionId?: string,
  ): Promise<
    ApiResponseDto<{ deliveries: DeliveryResponseDto[]; pagination: any }>
  > {
    try {
      const options: GetDeliveriesOptions = {
        page: page || 1,
        limit: limit || 10,
        status,
        transactionId,
      };

      const result = await this.getDeliveriesUseCase.execute(options);

      const deliveryDtos: DeliveryResponseDto[] = result.deliveries.map(
        (delivery) => ({
          id: delivery.id,
          transactionId: delivery.transactionId,
          deliveryAddressId: delivery.deliveryAddressId,
          trackingNumber: delivery.trackingNumber,
          carrier: delivery.carrier,
          status: delivery.status,
          estimatedDeliveryDate:
            delivery.estimatedDeliveryDate?.toISOString().split('T')[0] || null,
          shippedAt: delivery.shippedAt?.toISOString() || null,
          deliveredAt: delivery.deliveredAt?.toISOString() || null,
          deliveryNotes: delivery.deliveryNotes,
          createdAt: delivery.createdAt.toISOString(),
          updatedAt: delivery.updatedAt.toISOString(),
        }),
      );
      return {
        success: true,
        message: 'Deliveries retrieved successfully',
        data: {
          deliveries: deliveryDtos,
          pagination: {
            page: result.page,
            limit: result.limit,
            total: result.total,
            totalPages: result.totalPages,
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Failed to retrieve deliveries',
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
