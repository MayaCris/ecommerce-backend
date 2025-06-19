import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { CardType } from '../../../../shared/domain/enums/card-type.enum';
import { CreateCardTokenUseCase } from '../../application/use-cases/create-card-token.use-case';
import { ProcessPaymentUseCase } from '../../application/use-cases/process-payment.use-case';
import { GetPaymentStatusUseCase } from '../../application/use-cases/get-payment-status.use-case';
import {
  CreateCardTokenRequestDto,
  CreateCardTokenResponseDto,
} from '../dto/create-card-token.dto';
import {
  ProcessPaymentRequestDto,
  ProcessPaymentResponseDto,
} from '../dto/process-payment.dto';
import { GetPaymentStatusResponseDto } from '../dto/get-payment-status.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly createCardTokenUseCase: CreateCardTokenUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getPaymentStatusUseCase: GetPaymentStatusUseCase,
  ) {}

  @Post('cards/tokens')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a secure card token',
    description:
      'Tokenizes credit card information for secure payment processing',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Card token created successfully',
    type: CreateCardTokenResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid card data provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during token creation',
  })
  async createCardToken(
    @Body() request: CreateCardTokenRequestDto,
  ): Promise<CreateCardTokenResponseDto> {
    const result = await this.createCardTokenUseCase.execute({
      number: request.number,
      cvc: request.cvc,
      expiryMonth: request.expiryMonth,
      expiryYear: request.expiryYear,
      cardHolder: request.cardHolder,
    });
    if (result.isErr()) {
      throw new BadRequestException(result.error.message);
    }

    // Map application DTO to presentation DTO
    const response: CreateCardTokenResponseDto = {
      token: result.value.token,
      brand: this.mapStringToCardType(result.value.brand),
      name: result.value.name,
      lastFour: result.value.lastFour,
      bin: result.value.bin,
      expiryMonth: result.value.expiryMonth,
      expiryYear: result.value.expiryYear,
      cardHolder: result.value.cardHolder,
    };

    return response;
  }

  @Post('process')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Process a payment',
    description: 'Processes a payment using the provided payment method',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment processed successfully',
    type: ProcessPaymentResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid payment data provided',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during payment processing',
  })
  async processPayment(
    @Body() request: ProcessPaymentRequestDto,
  ): Promise<ProcessPaymentResponseDto> {
    const result = await this.processPaymentUseCase.execute({
      amount: request.amount,
      currency: request.currency,
      reference: request.reference,
      customerId: request.customerId,
      transactionId: request.transactionId,
      customerEmail: request.customerEmail,
      paymentMethod: request.paymentMethod,
      cardToken: request.cardToken,
      installments: request.installments,
    });

    if (result.isErr()) {
      throw new InternalServerErrorException(result.error.message);
    }
    return {
      paymentId: result.value.paymentId,
      status: result.value.status,
      reference: result.value.reference,
      amount: result.value.amount,
      currency: result.value.currency,
      externalTransactionId: result.value.apiTransactionId,
      externalReference: result.value.apiReference,
      statusMessage: result.value.statusMessage,
      redirectUrl: result.value.redirectUrl,
      createdAt: result.value.createdAt,
    };
  }

  @Get(':paymentId/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get payment status',
    description: 'Retrieves the current status of a payment',
  })
  @ApiParam({
    name: 'paymentId',
    description: 'Payment ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment status retrieved successfully',
    type: GetPaymentStatusResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Payment not found',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error during status retrieval',
  })
  async getPaymentStatus(
    @Param('paymentId') paymentId: string,
  ): Promise<GetPaymentStatusResponseDto> {
    const result = await this.getPaymentStatusUseCase.execute({
      paymentId,
    });

    if (result.isErr()) {
      if (result.error.message.includes('not found')) {
        throw new NotFoundException(result.error.message);
      }
      throw new InternalServerErrorException(result.error.message);
    }

    return {
      paymentId: result.value.paymentId,
      status: result.value.status,
      reference: result.value.reference,
      amount: result.value.amount,
      currency: result.value.currency,
      customerId: result.value.customerId,
      transactionId: result.value.transactionId,
      externalTransactionId: result.value.apiTransactionId,
      externalReference: result.value.apiReference,
      statusMessage: result.value.statusMessage,
      processingDate: result.value.processingDate,
      createdAt: result.value.createdAt,
      updatedAt: result.value.updatedAt,
    };
  }

  private mapStringToCardType(brand: string): CardType {
    if (!brand) {
      return CardType.OTHER;
    }
    
    switch (brand.toUpperCase()) {
      case 'VISA':
        return CardType.VISA;
      case 'MASTERCARD':
        return CardType.MASTERCARD;
      case 'AMEX':
        return CardType.AMEX;
      default:
        return CardType.OTHER;
    }
  }
}
