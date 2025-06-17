import { ValueObject } from '../base-value-object';

export interface PostalCodeProps {
  code: string;
  country: string;
  formattedCode: string;
}

/**
 * PostalCode Value Object
 * Handles postal code validation and formatting for different countries
 * Primarily focused on Colombian postal codes with international support
 */
export class PostalCode extends ValueObject<PostalCodeProps> {
  private static readonly DEFAULT_COUNTRY = 'Colombia';
  private static readonly COLOMBIA_PATTERN = /^\d{6}$/;
  private static readonly USA_PATTERN = /^\d{5}(-\d{4})?$/;
  private static readonly CANADA_PATTERN = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;
  private static readonly UK_PATTERN = /^[A-Z]{1,2}\d[A-Z\d]? \d[A-Z]{2}$/;

  // Colombian postal code ranges by department
  private static readonly COLOMBIA_DEPARTMENTS: Record<
    string,
    { min: number; max: number; name: string }
  > = {
    '05': { min: 50001, max: 59999, name: 'Antioquia' },
    '08': { min: 80001, max: 89999, name: 'Atlántico' },
    '11': { min: 110001, max: 119999, name: 'Bogotá D.C.' },
    '13': { min: 130001, max: 139999, name: 'Bolívar' },
    '15': { min: 150001, max: 159999, name: 'Boyacá' },
    '17': { min: 170001, max: 179999, name: 'Caldas' },
    '18': { min: 180001, max: 189999, name: 'Caquetá' },
    '19': { min: 190001, max: 199999, name: 'Cauca' },
    '20': { min: 200001, max: 209999, name: 'Cesar' },
    '23': { min: 230001, max: 239999, name: 'Córdoba' },
    '25': { min: 250001, max: 259999, name: 'Cundinamarca' },
    '27': { min: 270001, max: 279999, name: 'Chocó' },
    '41': { min: 410001, max: 419999, name: 'Huila' },
    '44': { min: 440001, max: 449999, name: 'La Guajira' },
    '47': { min: 470001, max: 479999, name: 'Magdalena' },
    '50': { min: 500001, max: 509999, name: 'Meta' },
    '52': { min: 520001, max: 529999, name: 'Nariño' },
    '54': { min: 540001, max: 549999, name: 'Norte de Santander' },
    '63': { min: 630001, max: 639999, name: 'Quindío' },
    '66': { min: 660001, max: 669999, name: 'Risaralda' },
    '68': { min: 680001, max: 689999, name: 'Santander' },
    '70': { min: 700001, max: 709999, name: 'Sucre' },
    '73': { min: 730001, max: 739999, name: 'Tolima' },
    '76': { min: 760001, max: 769999, name: 'Valle del Cauca' },
  };

  constructor(
    postalCode: string,
    country: string = PostalCode.DEFAULT_COUNTRY,
  ) {
    const normalizedCode = PostalCode.normalizePostalCode(postalCode, country);
    const formattedCode = PostalCode.formatPostalCode(normalizedCode, country);

    const props: PostalCodeProps = {
      code: normalizedCode,
      country: country.trim(),
      formattedCode,
    };

    super(props);
    this.validate(props);
  }

  protected validate(value: PostalCodeProps): void {
    if (!value.code || typeof value.code !== 'string') {
      throw new Error('Postal code is required and must be a string');
    }

    if (!value.country || typeof value.country !== 'string') {
      throw new Error('Country is required and must be a string');
    }

    // Validate based on country
    this.validateForCountry(value.code, value.country);
  }

  /**
   * Gets the postal code
   */
  public getCode(): string {
    return this._value.code;
  }

  /**
   * Gets the country
   */
  public getCountry(): string {
    return this._value.country;
  }

  /**
   * Gets the formatted postal code
   */
  public getFormattedCode(): string {
    return this._value.formattedCode;
  }

  /**
   * Checks if postal code is Colombian
   */
  public isColombian(): boolean {
    return this._value.country === 'Colombia';
  }

  /**
   * Gets the Colombian department name (if applicable)
   */
  public getColombianDepartment(): string | null {
    if (!this.isColombian()) {
      return null;
    }

    const departmentCode = this._value.code.substring(0, 2);
    const department = PostalCode.COLOMBIA_DEPARTMENTS[departmentCode];
    return department ? department.name : null;
  }

  /**
   * Gets the Colombian department code (if applicable)
   */
  public getColombianDepartmentCode(): string | null {
    if (!this.isColombian()) {
      return null;
    }

    const departmentCode = this._value.code.substring(0, 2);
    return PostalCode.COLOMBIA_DEPARTMENTS[departmentCode]
      ? departmentCode
      : null;
  }

  /**
   * Checks if postal code is in a major Colombian city
   */
  public isInMajorCity(): boolean {
    if (!this.isColombian()) {
      return false;
    }

    const code = parseInt(this._value.code, 10);

    // Major cities postal code ranges
    const majorCities = [
      { min: 110001, max: 119999, name: 'Bogotá' },
      { min: 500001, max: 509999, name: 'Medellín (Metro)' },
      { min: 760001, max: 769999, name: 'Cali' },
      { min: 80001, max: 89999, name: 'Barranquilla' },
      { min: 130001, max: 139999, name: 'Cartagena' },
      { min: 680001, max: 689999, name: 'Bucaramanga' },
    ];

    return majorCities.some((city) => code >= city.min && code <= city.max);
  }

  /**
   * Creates a Colombian postal code
   */
  public static createColombian(postalCode: string): PostalCode {
    return new PostalCode(postalCode, 'Colombia');
  }

  /**
   * Creates a US postal code
   */
  public static createUSA(postalCode: string): PostalCode {
    return new PostalCode(postalCode, 'USA');
  }

  /**
   * Validates postal code format for country
   */
  public static isValidForCountry(
    postalCode: string,
    country: string,
  ): boolean {
    try {
      new PostalCode(postalCode, country);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets the pattern for a specific country
   */
  public static getPatternForCountry(country: string): RegExp | null {
    switch (country.toLowerCase()) {
      case 'colombia':
        return PostalCode.COLOMBIA_PATTERN;
      case 'usa':
      case 'united states':
        return PostalCode.USA_PATTERN;
      case 'canada':
        return PostalCode.CANADA_PATTERN;
      case 'uk':
      case 'united kingdom':
        return PostalCode.UK_PATTERN;
      default:
        return null;
    }
  }

  /**
   * Normalizes postal code based on country
   */
  private static normalizePostalCode(
    postalCode: string,
    country: string,
  ): string {
    let normalized = postalCode.trim().toUpperCase();

    switch (country.toLowerCase()) {
      case 'colombia':
      case 'usa':
        // Remove all non-digits for numeric postal codes
        normalized = normalized.replace(/\D/g, '');
        break;
      case 'canada':
      case 'uk':
        // Keep alphanumeric and spaces for formatted postal codes
        normalized = normalized.replace(/[^A-Z0-9\s]/g, '');
        break;
      default:
        // Default: remove special characters but keep alphanumeric and spaces
        normalized = normalized.replace(/[^A-Z0-9\s]/g, '');
        break;
    }

    return normalized;
  }

  /**
   * Formats postal code based on country standards
   */
  private static formatPostalCode(postalCode: string, country: string): string {
    switch (country.toLowerCase()) {
      case 'colombia':
        // Colombian format: 6 digits, no special formatting
        return postalCode;
      case 'usa':
        // US format: 12345 or 12345-6789
        if (postalCode.length === 9) {
          return `${postalCode.substring(0, 5)}-${postalCode.substring(5)}`;
        }
        return postalCode;
      case 'canada':
        // Canadian format: A1A 1A1
        if (postalCode.length === 6) {
          return `${postalCode.substring(0, 3)} ${postalCode.substring(3)}`;
        }
        return postalCode;
      default:
        return postalCode;
    }
  }

  /**
   * Validates postal code for specific country
   */
  private validateForCountry(postalCode: string, country: string): void {
    const pattern = PostalCode.getPatternForCountry(country);

    if (!pattern) {
      // Generic validation for unknown countries
      if (postalCode.length < 3 || postalCode.length > 10) {
        throw new Error(
          `Postal code for ${country} must be between 3 and 10 characters`,
        );
      }
      return;
    }

    if (!pattern.test(this._value.formattedCode)) {
      const countryName =
        country.charAt(0).toUpperCase() + country.slice(1).toLowerCase();
      throw new Error(
        `Invalid ${countryName} postal code format: ${postalCode}`,
      );
    }

    // Additional Colombian validation
    if (country.toLowerCase() === 'colombia') {
      this.validateColombianPostalCode(postalCode);
    }
  }

  /**
   * Validates Colombian postal code against department ranges
   */
  private validateColombianPostalCode(postalCode: string): void {
    const code = parseInt(postalCode, 10);

    if (isNaN(code)) {
      throw new Error('Colombian postal code must be numeric');
    }

    const departmentCode = postalCode.substring(0, 2);
    const department = PostalCode.COLOMBIA_DEPARTMENTS[departmentCode];

    if (!department) {
      throw new Error(`Invalid Colombian department code: ${departmentCode}`);
    }

    if (code < department.min || code > department.max) {
      throw new Error(
        `Postal code ${postalCode} is not valid for ${department.name}. Valid range: ${department.min}-${department.max}`,
      );
    }
  }

  /**
   * Override toString to return formatted postal code
   */
  public toString(): string {
    return this._value.formattedCode;
  }
}
