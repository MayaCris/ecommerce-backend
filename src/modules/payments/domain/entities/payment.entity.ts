import { v4 as uuidv4 } from 'uuid';
import { PaymentStatus } from '../../../../shared/domain/enums/payment-status.enum';
import { PaymentMethod } from '../../../../shared/domain/enums/payment-method.enum';

export class Payment {
  private constructor(
    public readonly id: string,
    public readonly reference: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly customerId: string,
    public readonly transactionId: string,
    public readonly method: PaymentMethod,
    public readonly status: PaymentStatus,
    public readonly apiTransactionId?: string,
    public readonly apiReference?: string,
    public readonly statusMessage?: string,
    public readonly processingDate?: Date,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  static create(params: {
    reference: string;
    amount: number;
    currency: string;
    customerId: string;
    transactionId: string;
    method: PaymentMethod;
  }): Payment {
    return new Payment(
      uuidv4(),
      params.reference,
      params.amount,
      params.currency,
      params.customerId,
      params.transactionId,
      params.method,
      PaymentStatus.PENDING,
    );
  }

  updateStatus(
    status: PaymentStatus,
    apiTransactionId?: string,
    apiReference?: string,
    statusMessage?: string,
  ): Payment {
    return new Payment(
      this.id,
      this.reference,
      this.amount,
      this.currency,
      this.customerId,
      this.transactionId,
      this.method,
      status,
      apiTransactionId,
      apiReference,
      statusMessage,
      status === PaymentStatus.APPROVED || status === PaymentStatus.DECLINED
        ? new Date()
        : this.processingDate,
      this.createdAt,
      new Date(),
    );
  }

  isCompleted(): boolean {
    return (
      this.status === PaymentStatus.APPROVED ||
      this.status === PaymentStatus.DECLINED ||
      this.status === PaymentStatus.VOIDED ||
      this.status === PaymentStatus.ERROR
    );
  }

  isSuccessful(): boolean {
    return this.status === PaymentStatus.APPROVED;
  }
}
