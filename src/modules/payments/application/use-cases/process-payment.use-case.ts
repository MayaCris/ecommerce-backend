import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentStatus } from '../../../../shared/domain/enums/payment-status.enum';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { externalApiService } from '../../domain/services/external-api.service';
import { PAYMENT_TOKENS } from '../../payments.tokens';
import {
  ProcessPaymentDto,
  ProcessPaymentResponseDto,
} from '../dto/process-payment.dto';

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject(PAYMENT_TOKENS.PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
    @Inject(PAYMENT_TOKENS.EXTERNAL_API_SERVICE)
    private readonly externalApiService: externalApiService,
  ) {}

  async execute(
    dto: ProcessPaymentDto,
  ): Promise<Result<ProcessPaymentResponseDto, Error>> {
    try {
      // Create payment entity
      const payment = Payment.create({
        reference: dto.reference,
        amount: dto.amount,
        currency: dto.currency,
        customerId: dto.customerId,
        transactionId: dto.transactionId,
        method: dto.paymentMethod,
      });

      // Save payment with PENDING status
      const savedPayment = await this.paymentRepository.save(payment);

      try {
        // Get acceptance token
        const acceptanceToken =
          await this.externalApiService.getAcceptanceToken();

        // Prepare payment request for external API
        const paymentRequest = {
          amountInCents: dto.amount * 100, // Convert to cents
          currency: dto.currency,
          reference: dto.reference,
          customerEmail: dto.customerEmail,
          acceptanceToken,
          paymentMethod: {
            type: dto.paymentMethod,
            token: dto.cardToken,
            installments: dto.installments,
          },
        };

        // Process payment with external API
        const externalPaymentResponse =
          await this.externalApiService.createPayment(paymentRequest);

        // Update payment with external API response
        const updatedPayment = savedPayment.updateStatus(
          this.mapExternalStatusToPaymentStatus(externalPaymentResponse.status),
          externalPaymentResponse.id,
          externalPaymentResponse.reference,
          externalPaymentResponse.status_message,
        );

        // Save updated payment
        await this.paymentRepository.update(updatedPayment);

        // Return response
        const response: ProcessPaymentResponseDto = {
          paymentId: updatedPayment.id,
          status: updatedPayment.status,
          reference: updatedPayment.reference,
          amount: updatedPayment.amount,
          currency: updatedPayment.currency,
          apiTransactionId: updatedPayment.apiTransactionId,
          apiReference: updatedPayment.apiReference,
          statusMessage: updatedPayment.statusMessage,
          redirectUrl: externalPaymentResponse.redirect_url,
          createdAt: updatedPayment.createdAt,
        };

        return ok(response);
      } catch (externalError) {
        // Update payment status to ERROR if external API fails
        const errorPayment = savedPayment.updateStatus(
          PaymentStatus.ERROR,
          undefined,
          undefined,
          externalError instanceof Error
            ? externalError.message
            : 'External API error',
        );
        await this.paymentRepository.update(errorPayment);

        return err(
          externalError instanceof Error
            ? externalError
            : new Error('External payment processing failed'),
        );
      }
    } catch (error) {
      return err(
        error instanceof Error ? error : new Error('Failed to process payment'),
      );
    }
  }

  private mapExternalStatusToPaymentStatus(
    externalStatus: string,
  ): PaymentStatus {
    switch (externalStatus.toUpperCase()) {
      case 'APPROVED':
        return PaymentStatus.APPROVED;
      case 'DECLINED':
        return PaymentStatus.DECLINED;
      case 'PENDING':
        return PaymentStatus.PENDING;
      case 'VOIDED':
        return PaymentStatus.VOIDED;
      default:
        return PaymentStatus.ERROR;
    }
  }
}
