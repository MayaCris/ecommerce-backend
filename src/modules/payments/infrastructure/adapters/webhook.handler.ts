import { Injectable, Inject } from '@nestjs/common';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { externalApiService } from '../../domain/services/external-api.service';
import { PaymentStatus } from '../../../../shared/domain/enums/payment-status.enum';
import { PAYMENT_TOKENS } from '../../payments.tokens';

export interface WebhookPayload {
  event: string;
  data: {
    transaction: {
      id: string;
      amount_in_cents: number;
      reference: string;
      customer_email: string;
      currency: string;
      payment_method_type: string;
      redirect_url: string;
      status: string;
      shipping_address: any;
      payment_link_id: string;
      payment_source_id: any;
    };
  };
  sent_at: string;
  timestamp: number;
  signature: {
    properties: string[];
    checksum: string;
  };
  environment: string;
}

@Injectable()
export class WebhookHandler {
  constructor(
    @Inject(PAYMENT_TOKENS.PAYMENT_REPOSITORY)
    private readonly paymentRepository: PaymentRepository,
    @Inject(PAYMENT_TOKENS.EXTERNAL_API_SERVICE)
    private readonly externalApiService: externalApiService,
  ) {}

  async handleTransactionUpdate(
    payload: WebhookPayload,
    signature: string,
    timestamp: string,
    rawBody: string,
  ): Promise<void> {
    // Validate signature
    const isValidSignature = this.externalApiService.validateSignature(
      signature,
      timestamp,
      rawBody,
    );

    if (!isValidSignature) {
      throw new Error('Invalid webhook signature');
    }

    const { transaction } = payload.data;

    // Find payment by external transaction ID or reference
    let payment = await this.paymentRepository.findByApiReference(
      transaction.reference,
    );

    if (!payment) {
      console.warn(`Payment not found for reference: ${transaction.reference}`);
      return;
    }

    // Map External API status to our payment status
    const newStatus = this.mapExternalApiStatusToPaymentStatus(
      transaction.status,
    );

    // Update payment status
    const updatedPayment = payment.updateStatus(
      newStatus,
      transaction.id,
      transaction.reference,
      `Webhook update: ${transaction.status}`,
    );

    // Save updated payment
    await this.paymentRepository.update(updatedPayment);

    console.log(
      `Payment ${payment.id} status updated to ${newStatus} via webhook`,
    );
  }

  private mapExternalApiStatusToPaymentStatus(
    externalApiStatus: string,
  ): PaymentStatus {
    switch (externalApiStatus.toUpperCase()) {
      case 'APPROVED':
        return PaymentStatus.APPROVED;
      case 'DECLINED':
        return PaymentStatus.DECLINED;
      case 'PENDING':
        return PaymentStatus.PENDING;
      case 'VOIDED':
        return PaymentStatus.VOIDED;
      case 'ERROR':
        return PaymentStatus.ERROR;
      default:
        return PaymentStatus.ERROR;
    }
  }
}
