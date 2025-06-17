import { ValueObject } from '../base-value-object';

export interface ExpirationDateProps {
  month: number;
  year: number;
  formattedDate: string;
  expirationDate: Date;
}

/**
 * ExpirationDate Value Object
 * Handles credit card expiration date validation and formatting
 */
export class ExpirationDate extends ValueObject<ExpirationDateProps> {
  private static readonly MIN_MONTH = 1;
  private static readonly MAX_MONTH = 12;
  private static readonly CURRENT_CENTURY = 2000;
  private static readonly FORMAT_REGEX = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;

  constructor(month: number | string, year?: number | string) {
    let parsedMonth: number;
    let parsedYear: number;

    // Handle MM/YY format string input
    if (
      typeof month === 'string' &&
      month.includes('/') &&
      year === undefined
    ) {
      const parsed = ExpirationDate.parseMMYYFormat(month);
      parsedMonth = parsed.month;
      parsedYear = parsed.year;
    } else {
      parsedMonth = typeof month === 'string' ? parseInt(month, 10) : month;
      parsedYear = typeof year === 'string' ? parseInt(year, 10) : year || 0;
    }

    // Convert 2-digit year to 4-digit year
    if (parsedYear < 100) {
      parsedYear += ExpirationDate.CURRENT_CENTURY;
    }

    const expirationDate = ExpirationDate.createExpirationDate(
      parsedMonth,
      parsedYear,
    );
    const formattedDate = ExpirationDate.formatDate(parsedMonth, parsedYear);

    const props: ExpirationDateProps = {
      month: parsedMonth,
      year: parsedYear,
      formattedDate,
      expirationDate,
    };

    super(props);
    this.validate(props);
  }

  protected validate(value: ExpirationDateProps): void {
    // Month validation
    if (
      !Number.isInteger(value.month) ||
      value.month < ExpirationDate.MIN_MONTH ||
      value.month > ExpirationDate.MAX_MONTH
    ) {
      throw new Error(
        `Month must be between ${ExpirationDate.MIN_MONTH} and ${ExpirationDate.MAX_MONTH}. Got: ${value.month}`,
      );
    }

    // Year validation
    if (
      !Number.isInteger(value.year) ||
      value.year < ExpirationDate.CURRENT_CENTURY
    ) {
      throw new Error(`Year must be a valid 4-digit year. Got: ${value.year}`);
    }

    // Expiration validation - card must not be expired
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
    const currentYear = now.getFullYear();

    if (
      value.year < currentYear ||
      (value.year === currentYear && value.month < currentMonth)
    ) {
      throw new Error(
        `Card has expired. Expiration date: ${value.formattedDate}`,
      );
    }

    // Future validation - not too far in the future (reasonable limit: 10 years)
    const maxYear = currentYear + 10;
    if (value.year > maxYear) {
      throw new Error(
        `Expiration year too far in the future. Maximum allowed: ${maxYear}`,
      );
    }
  }

  /**
   * Gets the month (1-12)
   */
  public getMonth(): number {
    return this._value.month;
  }

  /**
   * Gets the year (4-digit)
   */
  public getYear(): number {
    return this._value.year;
  }

  /**
   * Gets the formatted date (MM/YY)
   */
  public getFormattedDate(): string {
    return this._value.formattedDate;
  }

  /**
   * Gets the expiration date as Date object (last day of the month)
   */
  public getExpirationDate(): Date {
    return new Date(this._value.expirationDate);
  }

  /**
   * Checks if the card is expired
   */
  public isExpired(): boolean {
    const now = new Date();
    return this._value.expirationDate < now;
  }

  /**
   * Checks if the card expires within the specified months
   */
  public expiresWithinMonths(months: number): boolean {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + months);
    return this._value.expirationDate <= futureDate;
  }

  /**
   * Gets the number of months until expiration
   */
  public getMonthsUntilExpiration(): number {
    const now = new Date();
    const expirationDate = this._value.expirationDate;

    const yearDiff = expirationDate.getFullYear() - now.getFullYear();
    const monthDiff = expirationDate.getMonth() - now.getMonth();

    return yearDiff * 12 + monthDiff;
  }

  /**
   * Checks if expiration is valid (not expired)
   */
  public isValid(): boolean {
    try {
      this.validate(this._value);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets a display format for UI (MM/YYYY)
   */
  public getFullYearFormat(): string {
    const monthStr = this._value.month.toString().padStart(2, '0');
    return `${monthStr}/${this._value.year}`;
  }

  /**
   * Creates from MM/YY format string
   */
  public static fromMMYY(mmyyString: string): ExpirationDate {
    return new ExpirationDate(mmyyString);
  }

  /**
   * Creates from separate month and year
   */
  public static fromMonthYear(month: number, year: number): ExpirationDate {
    return new ExpirationDate(month, year);
  }

  /**
   * Validates MM/YY format string
   */
  public static isValidFormat(mmyyString: string): boolean {
    return ExpirationDate.FORMAT_REGEX.test(mmyyString);
  }

  /**
   * Validates expiration date without creating instance
   */
  public static isValidExpirationDate(
    month: number | string,
    year?: number | string,
  ): boolean {
    try {
      new ExpirationDate(month, year);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Parses MM/YY format string
   */
  private static parseMMYYFormat(mmyyString: string): {
    month: number;
    year: number;
  } {
    if (!ExpirationDate.FORMAT_REGEX.test(mmyyString)) {
      throw new Error(
        `Invalid MM/YY format. Expected format: MM/YY. Got: ${mmyyString}`,
      );
    }

    const [monthStr, yearStr] = mmyyString.split('/');
    const month = parseInt(monthStr, 10);
    let year = parseInt(yearStr, 10);

    // Convert 2-digit year to 4-digit year
    if (year < 100) {
      year += ExpirationDate.CURRENT_CENTURY;
    }

    return { month, year };
  }

  /**
   * Creates expiration date (last day of the month)
   */
  private static createExpirationDate(month: number, year: number): Date {
    // Create date for the last day of the expiration month
    return new Date(year, month, 0, 23, 59, 59, 999);
  }

  /**
   * Formats date to MM/YY format
   */
  private static formatDate(month: number, year: number): string {
    const monthStr = month.toString().padStart(2, '0');
    const yearStr = (year % 100).toString().padStart(2, '0');
    return `${monthStr}/${yearStr}`;
  }

  /**
   * Override toString to return formatted date
   */
  public toString(): string {
    return this._value.formattedDate;
  }
}
