import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  Param,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { GetAllTransactionItemsUseCase } from '../../application/use-cases/get-all-transaction-items.use-case';
import { CreateTransactionItemUseCase } from '../../application/use-cases/create-transaction-item.use-case';
import { TransactionItemResponseDto } from '../dto/transaction-item-response.dto';
import { CreateTransactionItemDto } from '../dto/create-transaction-item.dto';
import { TransactionItemDomain } from '../../domain/entities/transaction-item-domain.entity';

@ApiTags('transaction-items')
@Controller('transaction-items')
export class TransactionItemsController {
  constructor(
    private readonly getAllTransactionItemsUseCase: GetAllTransactionItemsUseCase,
    private readonly createTransactionItemUseCase: CreateTransactionItemUseCase,
  ) {}

  /**
   * Helper method to map TransactionItemDomain to TransactionItemResponseDto
   */
  private mapToResponseDto(
    transactionItem: TransactionItemDomain,
  ): TransactionItemResponseDto {
    return {
      id: transactionItem.id,
      transactionId: transactionItem.transactionId,
      productId: transactionItem.productId,
      quantity: transactionItem.quantity.amount,
      unitPrice: transactionItem.unitPrice.amount,
      totalPrice: transactionItem.totalPrice.amount,
      createdAt: transactionItem.createdAt,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all transaction items' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved all transaction items',
    type: [TransactionItemResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findAll(): Promise<TransactionItemResponseDto[]> {
    try {
      const transactionItems =
        await this.getAllTransactionItemsUseCase.execute();
      return transactionItems.map((item) => this.mapToResponseDto(item));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to retrieve transaction items: ${errorMessage}`);
    }
  }

  @Get('by-transaction/:transactionId')
  @ApiOperation({ summary: 'Get all transaction items by transaction ID' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved transaction items for the transaction',
    type: [TransactionItemResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findByTransactionId(
    @Param('transactionId') transactionId: string,
  ): Promise<TransactionItemResponseDto[]> {
    try {
      const transactionItems =
        await this.getAllTransactionItemsUseCase.executeByTransactionId(
          transactionId,
        );
      return transactionItems.map((item) => this.mapToResponseDto(item));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to retrieve transaction items: ${errorMessage}`);
    }
  }

  @Get('by-product/:productId')
  @ApiOperation({ summary: 'Get all transaction items by product ID' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved transaction items for the product',
    type: [TransactionItemResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findByProductId(
    @Param('productId') productId: string,
  ): Promise<TransactionItemResponseDto[]> {
    try {
      const transactionItems =
        await this.getAllTransactionItemsUseCase.executeByProductId(productId);
      return transactionItems.map((item) => this.mapToResponseDto(item));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to retrieve transaction items: ${errorMessage}`);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction item' })
  @ApiBody({ type: CreateTransactionItemDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transaction item created successfully',
    type: TransactionItemResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async create(
    @Body() createTransactionItemDto: CreateTransactionItemDto,
  ): Promise<TransactionItemResponseDto> {
    try {
      const transactionItem = await this.createTransactionItemUseCase.execute({
        transactionId: createTransactionItemDto.transactionId,
        productId: createTransactionItemDto.productId,
        quantity: createTransactionItemDto.quantity,
        unitPrice: createTransactionItemDto.unitPrice,
        totalPrice: createTransactionItemDto.totalPrice,
      });

      return this.mapToResponseDto(transactionItem);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      if (
        errorMessage.includes('does not match calculated total') ||
        errorMessage.includes('must be greater than') ||
        errorMessage.includes('is required')
      ) {
        throw new BadRequestException(errorMessage);
      }
      throw new InternalServerErrorException(
        `Failed to create transaction item: ${errorMessage}`,
      );
    }
  }
}
