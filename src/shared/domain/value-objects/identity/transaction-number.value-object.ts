import { ValueObject } from '../base-value-object';

export interface TransactionNumberProps {
  value: string;
  prefix: string;
  timestamp: string;
  sequence: string;
}

/**
 * TransactionNumber Value Object
 * Generates and validates unique transaction numbers with specific format
 */
export class TransactionNumber extends ValueObject<TransactionNumberProps> {
  private static readonly DEFAULT_PREFIX = 'TXN';
  private static readonly MIN_LENGTH = 10;
  private static readonly MAX_LENGTH = 50;
  private static readonly SEQUENCE_LENGTH = 6;
  private static readonly PATTERN = /^[A-Z]{3}-\d{8}-[A-Z0-9]{6}$/;

  constructor(value?: string) {
    let props: TransactionNumberProps;

    if (value) {
      // Parse existing transaction number
      props = TransactionNumber.parseTransactionNumber(value);
    } else {
      // Generate new transaction number
      props = TransactionNumber.generateTransactionNumber();
    }

    super(props);
    this.validate(props);
  }

  protected validate(value: TransactionNumberProps): void {
    if (!value.value || typeof value.value !== 'string') {
      throw new Error('Transaction number is required and must be a string');
    }

    if (
      value.value.length < TransactionNumber.MIN_LENGTH ||
      value.value.length > TransactionNumber.MAX_LENGTH
    ) {
      throw new Error(
        `Transaction number length must be between ${TransactionNumber.MIN_LENGTH} and ${TransactionNumber.MAX_LENGTH} characters`,
      );
    }

    if (!TransactionNumber.PATTERN.test(value.value)) {
      throw new Error(
        'Transaction number must follow format: PREFIX-YYYYMMDD-SEQUENCE (e.g., TXN-20250617-AB1234)',
      );
    }

    if (!value.prefix || value.prefix.length !== 3) {
      throw new Error('Transaction number prefix must be exactly 3 characters');
    }

    if (!value.timestamp || value.timestamp.length !== 8) {
      throw new Error(
        'Transaction number timestamp must be exactly 8 digits (YYYYMMDD)',
      );
    }

    if (
      !value.sequence ||
      value.sequence.length !== TransactionNumber.SEQUENCE_LENGTH
    ) {
      throw new Error(
        `Transaction number sequence must be exactly ${TransactionNumber.SEQUENCE_LENGTH} characters`,
      );
    }
  }

  /**
   * Gets the complete transaction number
   */
  public getNumber(): string {
    return this._value.value;
  }

  /**
   * Gets the prefix part (e.g., 'TXN')
   */
  public getPrefix(): string {
    return this._value.prefix;
  }

  /**
   * Gets the timestamp part (e.g., '20250617')
   */
  public getTimestamp(): string {
    return this._value.timestamp;
  }

  /**
   * Gets the sequence part (e.g., 'AB1234')
   */
  public getSequence(): string {
    return this._value.sequence;
  }

  /**
   * Gets the date from the timestamp
   */
  public getDate(): Date {
    const year = parseInt(this._value.timestamp.substring(0, 4), 10);
    const month = parseInt(this._value.timestamp.substring(4, 6), 10) - 1; // Month is 0-indexed
    const day = parseInt(this._value.timestamp.substring(6, 8), 10);
    return new Date(year, month, day);
  }

  /**
   * Checks if the transaction number was generated today
   */
  public isFromToday(): boolean {
    const today = new Date();
    const transactionDate = this.getDate();
    return (
      today.getFullYear() === transactionDate.getFullYear() &&
      today.getMonth() === transactionDate.getMonth() &&
      today.getDate() === transactionDate.getDate()
    );
  }

  /**
   * Gets a formatted display version
   */
  public getDisplayFormat(): string {
    return `${this._value.prefix}-${this._value.timestamp}-${this._value.sequence}`;
  }

  /**
   * Gets a short reference (last 8 characters)
   */
  public getShortReference(): string {
    return this._value.value.slice(-8);
  }

  /**
   * Creates a new transaction number
   */
  public static generate(prefix?: string): TransactionNumber {
    const props = TransactionNumber.generateTransactionNumber(prefix);
    return new TransactionNumber(props.value);
  }

  /**
   * Creates from an existing transaction number string
   */
  public static fromString(transactionNumber: string): TransactionNumber {
    return new TransactionNumber(transactionNumber);
  }

  /**
   * Generates a new transaction number with specified or default prefix
   */
  private static generateTransactionNumber(
    prefix: string = TransactionNumber.DEFAULT_PREFIX,
  ): TransactionNumberProps {
    const timestamp = TransactionNumber.generateTimestamp();
    const sequence = TransactionNumber.generateSequence();
    const value = `${prefix}-${timestamp}-${sequence}`;

    return {
      value,
      prefix,
      timestamp,
      sequence,
    };
  }

  /**
   * Parses an existing transaction number string
   */
  private static parseTransactionNumber(
    transactionNumber: string,
  ): TransactionNumberProps {
    const parts = transactionNumber.split('-');

    if (parts.length !== 3) {
      throw new Error(
        'Invalid transaction number format. Expected: PREFIX-TIMESTAMP-SEQUENCE',
      );
    }

    const [prefix, timestamp, sequence] = parts;

    return {
      value: transactionNumber,
      prefix,
      timestamp,
      sequence,
    };
  }

  /**
   * Generates timestamp in YYYYMMDD format
   */
  private static generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  /**
   * Generates random alphanumeric sequence
   */
  private static generateSequence(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < TransactionNumber.SEQUENCE_LENGTH; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Validates transaction number format
   */
  public static isValid(transactionNumber: string): boolean {
    try {
      new TransactionNumber(transactionNumber);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Extracts just the sequence part from a transaction number
   */
  public static extractSequence(transactionNumber: string): string {
    const parts = transactionNumber.split('-');
    return parts.length === 3 ? parts[2] : '';
  }

  /**
   * Extracts the date part from a transaction number
   */
  public static extractDate(transactionNumber: string): Date | null {
    try {
      const instance = new TransactionNumber(transactionNumber);
      return instance.getDate();
    } catch {
      return null;
    }
  }

  /**
   * Override toString to return the transaction number
   */
  public toString(): string {
    return this._value.value;
  }
}
