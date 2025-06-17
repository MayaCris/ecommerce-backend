import { ValueObject } from '../base-value-object';

/**
 * SKU (Stock Keeping Unit) Value Object
 * Represents a unique product identifier
 */
export class SKU extends ValueObject<string> {
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 100;
  private static readonly VALID_PATTERN = /^[A-Z0-9]([A-Z0-9\-_]*[A-Z0-9])?$/;

  constructor(sku: string) {
    const normalizedSku = sku.trim().toUpperCase();
    super(normalizedSku);
    this.validate(normalizedSku);
  }

  protected validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('SKU cannot be empty');
    }

    if (value.length < SKU.MIN_LENGTH) {
      throw new Error(
        `SKU is too short. Minimum length is ${SKU.MIN_LENGTH} characters`,
      );
    }

    if (value.length > SKU.MAX_LENGTH) {
      throw new Error(
        `SKU is too long. Maximum length is ${SKU.MAX_LENGTH} characters`,
      );
    }

    if (!SKU.VALID_PATTERN.test(value)) {
      throw new Error(
        `Invalid SKU format: ${value}. SKU must contain only alphanumeric characters, hyphens, and underscores. Cannot start or end with special characters.`,
      );
    }

    // Additional validations
    if (
      value.includes('--') ||
      value.includes('__') ||
      value.includes('-_') ||
      value.includes('_-')
    ) {
      throw new Error('SKU cannot contain consecutive special characters');
    }
  }

  /**
   * Gets the SKU value
   */
  public get code(): string {
    return this._value;
  }

  /**
   * Checks if this SKU starts with a specific prefix
   */
  public hasPrefix(prefix: string): boolean {
    return this._value.startsWith(prefix.toUpperCase());
  }

  /**
   * Checks if this SKU ends with a specific suffix
   */
  public hasSuffix(suffix: string): boolean {
    return this._value.endsWith(suffix.toUpperCase());
  }

  /**
   * Gets the prefix part of the SKU (before first hyphen or underscore)
   */
  public getPrefix(): string {
    const match = this._value.match(/^([A-Z0-9]+)[-_]/);
    return match ? match[1] : this._value;
  }

  /**
   * Gets the suffix part of the SKU (after last hyphen or underscore)
   */
  public getSuffix(): string {
    const match = this._value.match(/[-_]([A-Z0-9]+)$/);
    return match ? match[1] : '';
  }

  /**
   * Checks if the SKU represents a variant (contains special characters)
   */
  public isVariant(): boolean {
    return /[-_]/.test(this._value);
  }

  /**
   * Creates a variant SKU by appending a suffix
   */
  public createVariant(suffix: string): SKU {
    const normalizedSuffix = suffix.trim().toUpperCase();
    if (!normalizedSuffix) {
      throw new Error('Variant suffix cannot be empty');
    }

    if (!/^[A-Z0-9]+$/.test(normalizedSuffix)) {
      throw new Error(
        'Variant suffix must contain only alphanumeric characters',
      );
    }

    return new SKU(`${this._value}-${normalizedSuffix}`);
  }

  /**
   * Creates a SKU from string with validation
   */
  public static create(sku: string): SKU {
    return new SKU(sku);
  }

  /**
   * Generates a random SKU with a given prefix
   */
  public static generateRandom(
    prefix: string = 'PRD',
    length: number = 8,
  ): SKU {
    if (length < 3 || length > 20) {
      throw new Error('Length must be between 3 and 20 characters');
    }

    const normalizedPrefix = prefix.trim().toUpperCase();
    if (!normalizedPrefix || !/^[A-Z0-9]+$/.test(normalizedPrefix)) {
      throw new Error('Prefix must contain only alphanumeric characters');
    }

    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, length - normalizedPrefix.length + 2)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '0');

    return new SKU(`${normalizedPrefix}${randomSuffix}`);
  }

  /**
   * Returns the SKU as string
   */
  public toString(): string {
    return this._value;
  }

  /**
   * Returns the JSON representation
   */
  public toJSON(): string {
    return this._value;
  }
}
