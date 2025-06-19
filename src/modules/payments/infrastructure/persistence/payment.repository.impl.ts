import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../domain/entities/payment.entity';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import { PaymentEntity } from './entities/payment.entity';

@Injectable()
export class PaymentRepositoryImpl implements PaymentRepository {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly ormRepository: Repository<PaymentEntity>,
  ) {}

  async save(payment: Payment): Promise<Payment> {
    const paymentEntity = this.toEntity(payment);
    const savedEntity = await this.ormRepository.save(paymentEntity);
    return this.toDomain(savedEntity);
  }

  async findById(id: string): Promise<Payment | null> {
    const paymentEntity = await this.ormRepository.findOne({
      where: { id },
    });

    return paymentEntity ? this.toDomain(paymentEntity) : null;
  }

  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    const paymentEntity = await this.ormRepository.findOne({
      where: { transactionId },
    });

    return paymentEntity ? this.toDomain(paymentEntity) : null;
  }

  async findByApiReference(apiReference: string): Promise<Payment | null> {
    const paymentEntity = await this.ormRepository.findOne({
      where: { apiReference },
    });

    return paymentEntity ? this.toDomain(paymentEntity) : null;
  }

  async update(payment: Payment): Promise<Payment> {
    const paymentEntity = this.toEntity(payment);
    const updatedEntity = await this.ormRepository.save(paymentEntity);
    return this.toDomain(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepository.delete(id);
  }

  private toEntity(payment: Payment): PaymentEntity {
    const entity = new PaymentEntity();
    entity.id = payment.id;
    entity.reference = payment.reference;
    entity.amount = payment.amount;
    entity.currency = payment.currency;
    entity.customerId = payment.customerId;
    entity.transactionId = payment.transactionId;
    entity.method = payment.method;
    entity.status = payment.status;
    entity.apiTransactionId = payment.apiTransactionId;
    entity.apiReference = payment.apiReference;
    entity.statusMessage = payment.statusMessage;
    entity.processingDate = payment.processingDate;
    entity.createdAt = payment.createdAt;
    entity.updatedAt = payment.updatedAt;
    return entity;
  }

  private toDomain(entity: PaymentEntity): Payment {
    // Using reflection to access private constructor
    const payment = Object.create(Payment.prototype);
    payment.id = entity.id;
    payment.reference = entity.reference;
    payment.amount = entity.amount;
    payment.currency = entity.currency;
    payment.customerId = entity.customerId;
    payment.transactionId = entity.transactionId;
    payment.method = entity.method;
    payment.status = entity.status;
    payment.apiTransactionId = entity.apiTransactionId;
    payment.apiReference = entity.apiReference;
    payment.statusMessage = entity.statusMessage;
    payment.processingDate = entity.processingDate;
    payment.createdAt = entity.createdAt;
    payment.updatedAt = entity.updatedAt;
    return payment;
  }
}
