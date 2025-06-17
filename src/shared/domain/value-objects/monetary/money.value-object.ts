import { ValueObject } from '../base-value-object';

export interface MoneyProps {
  amount: number;
  currency: string;
}

/**
 * Money Value Object
 * Represents a monetary amount with currency
 */
export class Money extends ValueObject<MoneyProps> {
  private static readonly DEFAULT_CURRENCY = 'USD';
  private static readonly MIN_AMOUNT = 0;
  private static readonly MAX_AMOUNT = 999999999.99;

  constructor(amount: number, currency: string = Money.DEFAULT_CURRENCY) {
    const props: MoneyProps = { amount, currency: currency.toUpperCase() };
    super(props);
    this.validate(props);
  }

  protected validate(value: MoneyProps): void {
    if (typeof value.amount !== 'number' || isNaN(value.amount)) {
      throw new Error('Amount must be a valid number');
    }

    if (value.amount < Money.MIN_AMOUNT) {
      throw new Error(`Amount cannot be negative. Got: ${value.amount}`);
    }

    if (value.amount > Money.MAX_AMOUNT) {
      throw new Error(
        `Amount cannot exceed ${Money.MAX_AMOUNT}. Got: ${value.amount}`,
      );
    }

    // Validate decimal places (max 2)
    const decimalPlaces = (value.amount.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      throw new Error(
        `Amount cannot have more than 2 decimal places. Got: ${value.amount}`,
      );
    }

    if (!value.currency || typeof value.currency !== 'string') {
      throw new Error('Currency must be a valid string');
    }

    if (value.currency.length !== 3) {
      throw new Error(
        `Currency must be a 3-letter code. Got: ${value.currency}`,
      );
    }
  }

  /**
   * Gets the amount
   */
  public get amount(): number {
    return this._value.amount;
  }

  /**
   * Gets the currency
   */
  public get currency(): string {
    return this._value.currency;
  }

  /**
   * Adds two Money objects
   */
  public add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(
      this.roundToTwoDecimals(this.amount + other.amount),
      this.currency,
    );
  }

  /**
   * Subtracts another Money object from this one
   */
  public subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this.roundToTwoDecimals(this.amount - other.amount);
    return new Money(result, this.currency);
  }

  /**
   * Multiplies the amount by a factor
   */
  public multiply(factor: number): Money {
    if (typeof factor !== 'number' || isNaN(factor)) {
      throw new Error('Factor must be a valid number');
    }
    return new Money(
      this.roundToTwoDecimals(this.amount * factor),
      this.currency,
    );
  }

  /**
   * Divides the amount by a divisor
   */
  public divide(divisor: number): Money {
    if (typeof divisor !== 'number' || isNaN(divisor) || divisor === 0) {
      throw new Error('Divisor must be a valid non-zero number');
    }
    return new Money(
      this.roundToTwoDecimals(this.amount / divisor),
      this.currency,
    );
  }

  /**
   * Checks if this amount is greater than another
   */
  public isGreaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount > other.amount;
  }

  /**
   * Checks if this amount is less than another
   */
  public isLessThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount < other.amount;
  }

  /**
   * Checks if this amount is greater than or equal to another
   */
  public isGreaterThanOrEqual(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount >= other.amount;
  }

  /**
   * Checks if this amount is less than or equal to another
   */
  public isLessThanOrEqual(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount <= other.amount;
  }

  /**
   * Checks if this amount is zero
   */
  public isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * Checks if this amount is positive
   */
  public isPositive(): boolean {
    return this.amount > 0;
  }

  /**
   * Returns a formatted string representation
   */
  public format(): string {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(this.amount);
  }

  /**
   * Creates a Money object from a string amount
   */
  public static fromString(
    amount: string,
    currency: string = Money.DEFAULT_CURRENCY,
  ): Money {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      throw new Error(`Invalid amount string: ${amount}`);
    }
    return new Money(numericAmount, currency);
  }

  /**
   * Creates a zero Money object
   */
  public static zero(currency: string = Money.DEFAULT_CURRENCY): Money {
    return new Money(0, currency);
  }

  /**
   * Returns string representation
   */
  public toString(): string {
    return this.format();
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Currency mismatch: ${this.currency} !== ${other.currency}`,
      );
    }
  }

  private roundToTwoDecimals(amount: number): number {
    return Math.round(amount * 100) / 100;
  }
}
