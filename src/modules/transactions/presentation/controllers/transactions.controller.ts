import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { GetTransactionsUseCase } from '../../application/use-cases/get-transactions.use-case';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction.use-case';
import { GetAllTransactionsUseCase } from '../../application/use-cases/get-all-transactions.use-case';
import { TransactionResponseDto } from '../dto/transaction-response.dto';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { TransactionDomain } from '../../domain/entities/transaction-domain.entity';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly getAllTransactionsUseCase: GetAllTransactionsUseCase,
  ) {}

  /**
   * Helper method to map TransactionDomain to TransactionResponseDto
   */
  private mapToResponseDto(
    transaction: TransactionDomain,
  ): TransactionResponseDto {
    return {
      id: transaction.id,
      transactionNumber: transaction.transactionNumber,
      customerId: transaction.customerId,
      deliveryAddressId: transaction.deliveryAddressId,
      subtotal: transaction.subtotal.amount,
      baseFee: transaction.baseFee.amount,
      deliveryFee: transaction.deliveryFee.amount,
      totalAmount: transaction.totalAmount.amount,
      status: transaction.status,
      apiTransactionId: transaction.apiTransactionId,
      apiReference: transaction.apiReference,
      cardType: transaction.cardType,
      cardLastFourDigits: transaction.cardLastFourDigits,
      processedAt: transaction.processedAt,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of transactions to return',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of transactions to skip',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved all transactions',
    type: [TransactionResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<TransactionResponseDto[]> {
    const transactions = await this.getTransactionsUseCase.execute(
      limit,
      offset,
    );
    return transactions.map((transaction) =>
      this.mapToResponseDto(transaction),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved transaction',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Transaction not found',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findById(
    @Param('id') id: string,
  ): Promise<TransactionResponseDto | null> {
    const transaction = await this.getTransactionsUseCase.getById(id);

    if (!transaction) {
      return null;
    }

    return this.mapToResponseDto(transaction);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get transactions by customer ID' })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved customer transactions',
    type: [TransactionResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error',
  })
  async findByCustomerId(
    @Param('customerId') customerId: string,
  ): Promise<TransactionResponseDto[]> {
    const transactions =
      await this.getTransactionsUseCase.getByCustomerId(customerId);
    return transactions.map((transaction) =>
      this.mapToResponseDto(transaction),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transaction created successfully',
    type: TransactionResponseDto,
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
    @Body() createTransactionDto: CreateTransactionDto,
  ): Promise<TransactionResponseDto> {
    const transaction = await this.createTransactionUseCase.execute({
      customerId: createTransactionDto.customerId,
      deliveryAddressId: createTransactionDto.deliveryAddressId,
      subtotal: createTransactionDto.subtotal,
      baseFee: createTransactionDto.baseFee,
      deliveryFee: createTransactionDto.deliveryFee,
      totalAmount: createTransactionDto.totalAmount,
      status: createTransactionDto.status,
      apiTransactionId: createTransactionDto.apiTransactionId,
      apiReference: createTransactionDto.apiReference,
      cardType: createTransactionDto.cardType,
      cardLastFourDigits: createTransactionDto.cardLastFourDigits,
    });

    return this.mapToResponseDto(transaction);
  }
}
