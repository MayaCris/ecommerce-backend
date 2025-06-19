import { PaymentMethod } from '../../../../shared/domain/enums/payment-method.enum';

export interface ProcessPaymentDto {
  amount: number;
  currency: string;
  reference: string;
  customerId: string;
  transactionId: string;
  customerEmail: string;
  paymentMethod: PaymentMethod;
  cardToken?: string;
  installments?: number;
}

export interface ProcessPaymentResponseDto {
  paymentId: string;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  apiTransactionId?: string;
  apiReference?: string;
  statusMessage?: string;
  redirectUrl?: string;
  createdAt: Date;
}
