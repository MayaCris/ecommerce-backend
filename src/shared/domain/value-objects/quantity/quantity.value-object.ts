import { ValueObject } from '../base-value-object';

/**
 * Quantity Value Object
 * Represents a non-negative integer quantity
 */
export class Quantity extends ValueObject<number> {
  private static readonly MIN_VALUE = 0;
  private static readonly MAX_VALUE = 999999;

  constructor(value: number) {
    const normalizedValue = Math.floor(value);
    super(normalizedValue);
    this.validate(normalizedValue);
  }

  protected validate(value: number): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Quantity must be a valid number');
    }

    if (!Number.isInteger(value)) {
      throw new Error('Quantity must be an integer');
    }

    if (value < Quantity.MIN_VALUE) {
      throw new Error(`Quantity cannot be negative. Got: ${value}`);
    }

    if (value > Quantity.MAX_VALUE) {
      throw new Error(
        `Quantity cannot exceed ${Quantity.MAX_VALUE}. Got: ${value}`,
      );
    }
  }

  /**
   * Gets the quantity value
   */
  public get amount(): number {
    return this._value;
  }

  /**
   * Adds quantities
   */
  public add(other: Quantity): Quantity {
    return new Quantity(this._value + other._value);
  }

  /**
   * Subtracts quantities
   */
  public subtract(other: Quantity): Quantity {
    return new Quantity(this._value - other._value);
  }

  /**
   * Multiplies quantity by a factor
   */
  public multiply(factor: number): Quantity {
    if (typeof factor !== 'number' || isNaN(factor) || factor < 0) {
      throw new Error('Factor must be a non-negative number');
    }
    return new Quantity(Math.floor(this._value * factor));
  }

  /**
   * Checks if quantity is zero
   */
  public isZero(): boolean {
    return this._value === 0;
  }

  /**
   * Checks if quantity is positive
   */
  public isPositive(): boolean {
    return this._value > 0;
  }

  /**
   * Checks if this quantity is greater than another
   */
  public isGreaterThan(other: Quantity): boolean {
    return this._value > other._value;
  }

  /**
   * Checks if this quantity is less than another
   */
  public isLessThan(other: Quantity): boolean {
    return this._value < other._value;
  }

  /**
   * Checks if this quantity is greater than or equal to another
   */
  public isGreaterThanOrEqual(other: Quantity): boolean {
    return this._value >= other._value;
  }

  /**
   * Checks if this quantity is less than or equal to another
   */
  public isLessThanOrEqual(other: Quantity): boolean {
    return this._value <= other._value;
  }

  /**
   * Checks if there's sufficient quantity available
   */
  public isSufficient(required: Quantity): boolean {
    return this.isGreaterThanOrEqual(required);
  }

  /**
   * Gets the remaining quantity after deducting another quantity
   */
  public remaining(used: Quantity): Quantity {
    return this.subtract(used);
  }

  /**
   * Creates a Quantity from string
   */
  public static fromString(value: string): Quantity {
    const numericValue = parseInt(value, 10);
    if (isNaN(numericValue)) {
      throw new Error(`Invalid quantity string: ${value}`);
    }
    return new Quantity(numericValue);
  }

  /**
   * Creates a zero quantity
   */
  public static zero(): Quantity {
    return new Quantity(0);
  }

  /**
   * Creates a quantity of one
   */
  public static one(): Quantity {
    return new Quantity(1);
  }

  /**
   * Returns the quantity as string
   */
  public toString(): string {
    return this._value.toString();
  }

  /**
   * Returns the JSON representation
   */
  public toJSON(): number {
    return this._value;
  }
}
