export interface GetPaymentStatusDto {
  paymentId: string;
}

export interface GetPaymentStatusResponseDto {
  paymentId: string;
  status: string;
  reference: string;
  amount: number;
  currency: string;
  customerId: string;
  transactionId: string;
  apiTransactionId?: string;
  apiReference?: string;
  statusMessage?: string;
  processingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
