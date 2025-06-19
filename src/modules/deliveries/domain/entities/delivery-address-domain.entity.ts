/**
 * DeliveryAddress Domain Entity
 * Pure domain entity without infrastructure concerns
 */
export class DeliveryAddressDomain {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly streetAddress: string,
    public readonly city: string,
    public readonly state: string,
    public readonly postalCode: string,
    public readonly country: string,
    public readonly additionalInfo: string | null,
    public readonly isDefault: boolean,
    public readonly createdAt: Date,
  ) {}

  /**
   * Factory method to create a new delivery address
   */
  static create(data: {
    id?: string;
    customerId: string;
    streetAddress: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    additionalInfo?: string | null;
    isDefault?: boolean;
    createdAt?: Date;
  }): DeliveryAddressDomain {
    return new DeliveryAddressDomain(
      data.id || '',
      data.customerId,
      data.streetAddress,
      data.city,
      data.state,
      data.postalCode,
      data.country || 'Colombia',
      data.additionalInfo || null,
      data.isDefault || false,
      data.createdAt || new Date(),
    );
  }

  /**
   * Business logic: Validates the address completeness
   */
  isComplete(): boolean {
    return !!(
      this.streetAddress &&
      this.city &&
      this.state &&
      this.postalCode &&
      this.country
    );
  }

  /**
   * Business logic: Gets full address as string
   */
  getFullAddress(): string {
    const parts = [
      this.streetAddress,
      this.city,
      this.state,
      this.postalCode,
      this.country,
    ].filter(Boolean);
    return parts.join(', ');
  }
}
