import { Injectable } from '@nestjs/common';

/**
 * Base Domain Service
 *
 * Provides common functionality and patterns for all domain services.
 * Domain services encapsulate business logic that doesn't naturally
 * belong to a single entity or value object.
 */
@Injectable()
export abstract class BaseDomainService {
  protected readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  /**
   * Log domain operations for debugging and auditing
   */
  protected logDomainOperation(operation: string, data?: any): void {
    console.log(`[${this.serviceName}] ${operation}`, data);
  }

  /**
   * Validate business rules
   */
  protected validateBusinessRule(
    condition: boolean,
    errorMessage: string,
  ): void {
    if (!condition) {
      throw new Error(`Business rule violation: ${errorMessage}`);
    }
  }
}
