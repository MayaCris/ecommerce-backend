import { ValueObject } from '../base-value-object';

export interface PhoneNumberProps {
  number: string;
  countryCode: string;
  nationalNumber: string;
  formattedNumber: string;
}

/**
 * PhoneNumber Value Object
 * Handles phone number validation, formatting, and normalization
 * Primarily focused on Colombian phone numbers with international support
 */
export class PhoneNumber extends ValueObject<PhoneNumberProps> {
  private static readonly COLOMBIA_COUNTRY_CODE = '+57';
  private static readonly MIN_LENGTH = 7;
  private static readonly MAX_LENGTH = 15;

  // Colombian mobile prefixes
  private static readonly COLOMBIA_MOBILE_PREFIXES = [
    '300',
    '301',
    '302',
    '303',
    '304',
    '305',
    '310',
    '311',
    '312',
    '313',
    '314',
    '315',
    '316',
    '317',
    '318',
    '319',
    '320',
    '321',
    '322',
    '323',
    '324',
    '325',
    '350',
    '351',
  ];

  // Colombian landline area codes (major cities)
  private static readonly COLOMBIA_LANDLINE_CODES = [
    '601', // Bogotá
    '602', // Cali
    '604', // Medellín
    '605', // Barranquilla
    '607', // Bucaramanga
  ];

  constructor(phoneNumber: string, countryCode?: string) {
    const normalized = PhoneNumber.normalizePhoneNumber(phoneNumber);
    const props = PhoneNumber.parsePhoneNumber(normalized, countryCode);

    super(props);
    this.validate(props);
  }

  protected validate(value: PhoneNumberProps): void {
    if (!value.number || typeof value.number !== 'string') {
      throw new Error('Phone number is required and must be a string');
    }

    const digitsOnly = value.number.replace(/\D/g, '');

    if (
      digitsOnly.length < PhoneNumber.MIN_LENGTH ||
      digitsOnly.length > PhoneNumber.MAX_LENGTH
    ) {
      throw new Error(
        `Phone number must be between ${PhoneNumber.MIN_LENGTH} and ${PhoneNumber.MAX_LENGTH} digits`,
      );
    }

    if (!value.countryCode) {
      throw new Error('Country code is required');
    }

    if (!value.nationalNumber) {
      throw new Error('National number is required');
    }

    // Validate Colombian phone numbers specifically
    if (value.countryCode === PhoneNumber.COLOMBIA_COUNTRY_CODE) {
      this.validateColombianPhoneNumber(value.nationalNumber);
    }
  }

  /**
   * Gets the complete phone number with country code
   */
  public getNumber(): string {
    return this._value.number;
  }

  /**
   * Gets the country code (e.g., '+57')
   */
  public getCountryCode(): string {
    return this._value.countryCode;
  }

  /**
   * Gets the national number without country code
   */
  public getNationalNumber(): string {
    return this._value.nationalNumber;
  }

  /**
   * Gets the formatted phone number for display
   */
  public getFormattedNumber(): string {
    return this._value.formattedNumber;
  }

  /**
   * Checks if this is a Colombian phone number
   */
  public isColombian(): boolean {
    return this._value.countryCode === PhoneNumber.COLOMBIA_COUNTRY_CODE;
  }

  /**
   * Checks if this is a mobile number (for Colombian numbers)
   */
  public isMobile(): boolean {
    if (!this.isColombian()) {
      return false; // Can't determine for non-Colombian numbers
    }

    const nationalNumber = this._value.nationalNumber;
    return PhoneNumber.COLOMBIA_MOBILE_PREFIXES.some((prefix) =>
      nationalNumber.startsWith(prefix),
    );
  }

  /**
   * Checks if this is a landline number (for Colombian numbers)
   */
  public isLandline(): boolean {
    if (!this.isColombian()) {
      return false; // Can't determine for non-Colombian numbers
    }

    const nationalNumber = this._value.nationalNumber;
    return PhoneNumber.COLOMBIA_LANDLINE_CODES.some((code) =>
      nationalNumber.startsWith(code),
    );
  }

  /**
   * Gets the phone type (mobile, landline, or unknown)
   */
  public getType(): 'mobile' | 'landline' | 'unknown' {
    if (this.isMobile()) return 'mobile';
    if (this.isLandline()) return 'landline';
    return 'unknown';
  }

  /**
   * Gets a display format suitable for international use
   */
  public getInternationalFormat(): string {
    return `${this._value.countryCode} ${this._value.nationalNumber}`;
  }

  /**
   * Gets a format suitable for local use (without country code)
   */
  public getLocalFormat(): string {
    if (this.isColombian()) {
      const national = this._value.nationalNumber;
      if (this.isMobile() && national.length === 10) {
        // Format: 300 123 4567
        return `${national.substring(0, 3)} ${national.substring(3, 6)} ${national.substring(6)}`;
      }
      if (this.isLandline() && national.length >= 7) {
        // Format: (601) 234-5678
        const areaCode = national.substring(0, 3);
        const number = national.substring(3);
        return `(${areaCode}) ${number.substring(0, 3)}-${number.substring(3)}`;
      }
    }
    return this._value.nationalNumber;
  }

  /**
   * Creates a PhoneNumber from a string
   */
  public static fromString(
    phoneNumber: string,
    countryCode?: string,
  ): PhoneNumber {
    return new PhoneNumber(phoneNumber, countryCode);
  }

  /**
   * Creates a Colombian phone number
   */
  public static createColombian(phoneNumber: string): PhoneNumber {
    return new PhoneNumber(phoneNumber, PhoneNumber.COLOMBIA_COUNTRY_CODE);
  }

  /**
   * Validates if a string could be a valid phone number
   */
  public static isValid(phoneNumber: string, countryCode?: string): boolean {
    try {
      new PhoneNumber(phoneNumber, countryCode);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Normalizes phone number by removing non-digit characters except +
   */
  private static normalizePhoneNumber(phoneNumber: string): string {
    return phoneNumber.replace(/[^\d+]/g, '');
  }

  /**
   * Parses phone number into components
   */
  private static parsePhoneNumber(
    phoneNumber: string,
    defaultCountryCode?: string,
  ): PhoneNumberProps {
    let countryCode = defaultCountryCode || PhoneNumber.COLOMBIA_COUNTRY_CODE;
    let nationalNumber = phoneNumber;

    // Handle numbers that start with +
    if (phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('+57')) {
        countryCode = '+57';
        nationalNumber = phoneNumber.substring(3);
      } else if (phoneNumber.startsWith('+1')) {
        countryCode = '+1';
        nationalNumber = phoneNumber.substring(2);
      } else {
        // Extract first 1-3 digits after + as country code
        const match = phoneNumber.match(/^\+(\d{1,3})(\d+)$/);
        if (match) {
          countryCode = `+${match[1]}`;
          nationalNumber = match[2];
        }
      }
    } else if (phoneNumber.startsWith('57') && phoneNumber.length > 10) {
      // Handle numbers like 573001234567
      countryCode = '+57';
      nationalNumber = phoneNumber.substring(2);
    } else if (phoneNumber.startsWith('0') && phoneNumber.length === 11) {
      // Handle numbers like 03001234567 (Colombian format with leading 0)
      countryCode = '+57';
      nationalNumber = phoneNumber.substring(1);
    }

    const completeNumber = `${countryCode}${nationalNumber}`;
    const formattedNumber = PhoneNumber.formatPhoneNumber(
      nationalNumber,
      countryCode,
    );

    return {
      number: completeNumber,
      countryCode,
      nationalNumber,
      formattedNumber,
    };
  }

  /**
   * Formats phone number for display
   */
  private static formatPhoneNumber(
    nationalNumber: string,
    countryCode: string,
  ): string {
    if (
      countryCode === PhoneNumber.COLOMBIA_COUNTRY_CODE &&
      nationalNumber.length === 10
    ) {
      // Colombian mobile: +57 300 123 4567
      return `${countryCode} ${nationalNumber.substring(0, 3)} ${nationalNumber.substring(3, 6)} ${nationalNumber.substring(6)}`;
    }

    if (
      countryCode === PhoneNumber.COLOMBIA_COUNTRY_CODE &&
      nationalNumber.length >= 7
    ) {
      // Colombian landline: +57 (601) 234-5678
      const areaCode = nationalNumber.substring(0, 3);
      const number = nationalNumber.substring(3);
      return `${countryCode} (${areaCode}) ${number}`;
    }

    // Default international format
    return `${countryCode} ${nationalNumber}`;
  }

  /**
   * Validates Colombian phone number format
   */
  private validateColombianPhoneNumber(nationalNumber: string): void {
    if (nationalNumber.length === 10) {
      // Mobile number validation
      const prefix = nationalNumber.substring(0, 3);
      if (!PhoneNumber.COLOMBIA_MOBILE_PREFIXES.includes(prefix)) {
        throw new Error(`Invalid Colombian mobile prefix: ${prefix}`);
      }
    } else if (nationalNumber.length >= 7 && nationalNumber.length <= 8) {
      // Landline validation
      const areaCode = nationalNumber.substring(0, 3);
      if (!PhoneNumber.COLOMBIA_LANDLINE_CODES.includes(areaCode)) {
        throw new Error(`Invalid Colombian landline area code: ${areaCode}`);
      }
    } else {
      throw new Error(
        'Colombian phone numbers must be 10 digits (mobile) or 7-8 digits (landline)',
      );
    }
  }

  /**
   * Override toString to return formatted number
   */
  public toString(): string {
    return this._value.formattedNumber;
  }
}
