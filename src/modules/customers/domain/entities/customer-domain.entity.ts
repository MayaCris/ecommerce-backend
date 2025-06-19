import { Email, PhoneNumber } from '../../../../shared/domain/value-objects';

/**
 * Customer Domain Entity
 * Pure domain entity using Value Objects - contains business logic
 */
export class CustomerDomain {
  private constructor(
    public readonly id: string,
    public readonly email: Email,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone: PhoneNumber | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Factory method to create a new Customer
   */ static create(data: {
    id: string;
    email: Email;
    firstName: string;
    lastName: string;
    phone?: PhoneNumber | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): CustomerDomain {
    return new CustomerDomain(
      data.id,
      data.email,
      data.firstName,
      data.lastName,
      data.phone || null,
      data.createdAt || new Date(),
      data.updatedAt || new Date(),
    );
  }

  /**
   * Get customer's full name
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Get customer's display name for UI
   */
  getDisplayName(): string {
    return this.getFullName();
  }

  /**
   * Check if customer has a phone number
   */
  hasPhoneNumber(): boolean {
    return this.phone !== undefined && this.phone !== null;
  }
  /**
   * Get customer's contact info
   */
  getContactInfo(): {
    email: string;
    phone?: string;
    fullName: string;
  } {
    return {
      email: this.email.address,
      phone: this.phone?.getFormattedNumber(),
      fullName: this.getFullName(),
    };
  }

  /**
   * Check if customer was created recently (within specified days)
   */
  isRecentCustomer(daysAgo: number = 30): boolean {
    if (!this.createdAt) return false;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

    return this.createdAt >= cutoffDate;
  }

  /**
   * Validate customer data
   */
  isValid(): boolean {
    return (
      this.id.trim().length > 0 &&
      this.firstName.trim().length > 0 &&
      this.lastName.trim().length > 0 &&
      this.email.address.length > 0
    );
  }

  /**
   * Update customer information
   */
  updateInfo(data: {
    firstName?: string;
    lastName?: string;
    phone?: PhoneNumber;
  }): CustomerDomain {
    return CustomerDomain.create({
      id: this.id,
      email: this.email,
      firstName: data.firstName || this.firstName,
      lastName: data.lastName || this.lastName,
      phone: data.phone !== undefined ? data.phone : this.phone,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }
}
