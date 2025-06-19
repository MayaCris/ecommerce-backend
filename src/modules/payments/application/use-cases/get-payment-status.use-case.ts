import { Injectable, Inject } from '@nestjs/common';
import { Result, ok, err } from 'neverthrow';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { externalApiService } from '../../domain/services/external-api.service';
import { PAYMENT_TOKENS } from '../../payments.tokens';
import {
  GetPaymentStatusDto,
  GetPaymentStatusResponseDto,
} from '../dto/get-payment-status.dto';

@Injectable()
export class GetPaymentStatusUseCase {
  constructor(
    @Inject(PAYMENT_TOKENS.PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
    @Inject(PAYMENT_TOKENS.EXTERNAL_API_SERVICE)
    private readonly externalApiService: externalApiService,
  ) {}

  async execute(
    dto: GetPaymentStatusDto,
  ): Promise<Result<GetPaymentStatusResponseDto, Error>> {
    try {
      // Find payment in local database
      const payment = await this.paymentRepository.findById(dto.paymentId);

      if (!payment) {
        return err(new Error('Payment not found'));
      }

      // If payment is already completed, return current status
      if (payment.isCompleted()) {
        const response: GetPaymentStatusResponseDto = {
          paymentId: payment.id,
          status: payment.status,
          reference: payment.reference,
          amount: payment.amount,
          currency: payment.currency,
          customerId: payment.customerId,
          transactionId: payment.transactionId,
          apiTransactionId: payment.apiTransactionId,
          apiReference: payment.apiReference,
          statusMessage: payment.statusMessage,
          processingDate: payment.processingDate,
          createdAt: payment.createdAt,
          updatedAt: payment.updatedAt,
        };

        return ok(response);
      }

      // If payment is still pending, check with external API
      if (payment.apiTransactionId) {
        try {
          const externalStatus = await this.externalApiService.getPayment(
            payment.apiTransactionId,
          );

          // Update payment status if it has changed
          const updatedPayment = payment.updateStatus(
            this.mapExternalStatusToPaymentStatus(externalStatus.status),
            payment.apiTransactionId,
            externalStatus.reference,
            externalStatus.status_message,
          );

          // Save updated payment if status changed
          if (updatedPayment.status !== payment.status) {
            await this.paymentRepository.update(updatedPayment);
          }

          const response: GetPaymentStatusResponseDto = {
            paymentId: updatedPayment.id,
            status: updatedPayment.status,
            reference: updatedPayment.reference,
            amount: updatedPayment.amount,
            currency: updatedPayment.currency,
            customerId: updatedPayment.customerId,
            transactionId: updatedPayment.transactionId,
            apiTransactionId: updatedPayment.apiTransactionId,
            apiReference: updatedPayment.apiReference,
            statusMessage: updatedPayment.statusMessage,
            processingDate: updatedPayment.processingDate,
            createdAt: updatedPayment.createdAt,
            updatedAt: updatedPayment.updatedAt,
          };

          return ok(response);
        } catch (externalError) {
          // If external API fails, return current local status
          const response: GetPaymentStatusResponseDto = {
            paymentId: payment.id,
            status: payment.status,
            reference: payment.reference,
            amount: payment.amount,
            currency: payment.currency,
            customerId: payment.customerId,
            transactionId: payment.transactionId,
            apiTransactionId: payment.apiTransactionId,
            apiReference: payment.apiReference,
            statusMessage: payment.statusMessage,
            processingDate: payment.processingDate,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
          };

          return ok(response);
        }
      }

      // Return current payment status
      const response: GetPaymentStatusResponseDto = {
        paymentId: payment.id,
        status: payment.status,
        reference: payment.reference,
        amount: payment.amount,
        currency: payment.currency,
        customerId: payment.customerId,
        transactionId: payment.transactionId,
        apiTransactionId: payment.apiTransactionId,
        apiReference: payment.apiReference,
        statusMessage: payment.statusMessage,
        processingDate: payment.processingDate,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      };

      return ok(response);
    } catch (error) {
      return err(
        error instanceof Error
          ? error
          : new Error('Failed to get payment status'),
      );
    }
  }

  private mapExternalStatusToPaymentStatus(externalStatus: string) {
    // Import PaymentStatus here to avoid circular dependencies
    const { PaymentStatus } = require('../../domain/entities/payment.entity');

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
