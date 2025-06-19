import { Payment } from '../entities/payment.entity';

export interface PaymentRepository {
  save(payment: Payment): Promise<Payment>;
  findById(id: string): Promise<Payment | null>;
  findByTransactionId(transactionId: string): Promise<Payment | null>;
  findByApiReference(apiReference: string): Promise<Payment | null>;
  update(payment: Payment): Promise<Payment>;
  delete(id: string): Promise<void>;
}
