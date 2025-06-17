import { ValueObject } from '../base-value-object';

export interface AddressProps {
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Address Value Object
 * Represents a complete postal address with validation and normalization
 */
export class Address extends ValueObject<AddressProps> {
  private static readonly MIN_STREET_LENGTH = 5;
  private static readonly MAX_STREET_LENGTH = 255;
  private static readonly MIN_CITY_LENGTH = 2;
  private static readonly MAX_CITY_LENGTH = 100;
  private static readonly COLOMBIA_POSTAL_CODE_PATTERN = /^\d{6}$/;
  private static readonly DEFAULT_COUNTRY = 'Colombia';

  // Colombian states/departments
  private static readonly VALID_STATES = [
    'Amazonas',
    'Antioquia',
    'Arauca',
    'Atlántico',
    'Bolívar',
    'Boyacá',
    'Caldas',
    'Caquetá',
    'Casanare',
    'Cauca',
    'Cesar',
    'Chocó',
    'Córdoba',
    'Cundinamarca',
    'Guainía',
    'Guaviare',
    'Huila',
    'La Guajira',
    'Magdalena',
    'Meta',
    'Nariño',
    'Norte de Santander',
    'Putumayo',
    'Quindío',
    'Risaralda',
    'San Andrés y Providencia',
    'Santander',
    'Sucre',
    'Tolima',
    'Valle del Cauca',
    'Vaupés',
    'Vichada',
  ];
  constructor(
    streetAddress: string,
    city: string,
    state: string,
    postalCode: string,
    country: string = Address.DEFAULT_COUNTRY,
  ) {
    const props: AddressProps = {
      streetAddress: Address.normalizeStreetAddress(streetAddress),
      city: Address.normalizeCity(city),
      state: Address.normalizeState(state),
      postalCode: Address.normalizePostalCode(postalCode),
      country: Address.normalizeCountry(country),
    };

    super(props);
    this.validate(props);
  }

  protected validate(value: AddressProps): void {
    // Street address validation
    if (!value.streetAddress || value.streetAddress.trim().length === 0) {
      throw new Error('Street address is required');
    }

    if (
      value.streetAddress.length < Address.MIN_STREET_LENGTH ||
      value.streetAddress.length > Address.MAX_STREET_LENGTH
    ) {
      throw new Error(
        `Street address must be between ${Address.MIN_STREET_LENGTH} and ${Address.MAX_STREET_LENGTH} characters`,
      );
    }

    // City validation
    if (!value.city || value.city.trim().length === 0) {
      throw new Error('City is required');
    }

    if (
      value.city.length < Address.MIN_CITY_LENGTH ||
      value.city.length > Address.MAX_CITY_LENGTH
    ) {
      throw new Error(
        `City must be between ${Address.MIN_CITY_LENGTH} and ${Address.MAX_CITY_LENGTH} characters`,
      );
    }

    // State validation for Colombia
    if (
      value.country === 'Colombia' &&
      !Address.VALID_STATES.includes(value.state)
    ) {
      throw new Error(
        `Invalid Colombian state: ${value.state}. Must be one of: ${Address.VALID_STATES.join(', ')}`,
      );
    }

    // Postal code validation for Colombia
    if (
      value.country === 'Colombia' &&
      !Address.COLOMBIA_POSTAL_CODE_PATTERN.test(value.postalCode)
    ) {
      throw new Error('Colombian postal code must be 6 digits');
    }

    // Country validation
    if (!value.country || value.country.trim().length === 0) {
      throw new Error('Country is required');
    }
  }

  /**
   * Gets the street address
   */
  public getStreetAddress(): string {
    return this._value.streetAddress;
  }

  /**
   * Gets the city
   */
  public getCity(): string {
    return this._value.city;
  }

  /**
   * Gets the state/department
   */
  public getState(): string {
    return this._value.state;
  }

  /**
   * Gets the postal code
   */
  public getPostalCode(): string {
    return this._value.postalCode;
  }

  /**
   * Gets the country
   */
  public getCountry(): string {
    return this._value.country;
  }

  /**
   * Gets the full formatted address
   */
  public getFullAddress(): string {
    return `${this._value.streetAddress}, ${this._value.city}, ${this._value.state} ${this._value.postalCode}, ${this._value.country}`;
  }

  /**
   * Gets the address formatted for labels/shipping
   */
  public getShippingLabel(): string {
    return [
      this._value.streetAddress,
      `${this._value.city}, ${this._value.state} ${this._value.postalCode}`,
      this._value.country,
    ].join('\n');
  }

  /**
   * Checks if the address is in Colombia
   */
  public isInColombia(): boolean {
    return this._value.country === 'Colombia';
  }

  /**
   * Gets the geographic region (useful for delivery calculations)
   */
  public getRegion(): string {
    if (!this.isInColombia()) {
      return 'International';
    }

    // Colombian regions for delivery purposes
    const caribbeanStates = [
      'Atlántico',
      'Bolívar',
      'Cesar',
      'Córdoba',
      'La Guajira',
      'Magdalena',
      'Sucre',
    ];
    const pacificStates = ['Chocó', 'Valle del Cauca', 'Cauca', 'Nariño'];
    const andinStates = [
      'Antioquia',
      'Boyacá',
      'Caldas',
      'Cundinamarca',
      'Huila',
      'Norte de Santander',
      'Quindío',
      'Risaralda',
      'Santander',
      'Tolima',
    ];
    const amazonStates = [
      'Amazonas',
      'Caquetá',
      'Guainía',
      'Guaviare',
      'Putumayo',
      'Vaupés',
    ];
    const orinoquiaStates = ['Arauca', 'Casanare', 'Meta', 'Vichada'];

    if (caribbeanStates.includes(this._value.state)) return 'Caribbean';
    if (pacificStates.includes(this._value.state)) return 'Pacific';
    if (andinStates.includes(this._value.state)) return 'Andean';
    if (amazonStates.includes(this._value.state)) return 'Amazon';
    if (orinoquiaStates.includes(this._value.state)) return 'Orinoquía';

    return 'Other';
  }

  /**
   * Creates an Address from individual components with validation
   */
  public static create(
    streetAddress: string,
    city: string,
    state: string,
    postalCode: string,
    country?: string,
  ): Address {
    return new Address(streetAddress, city, state, postalCode, country);
  }

  /**
   * Creates an Address from a single address string (basic parsing)
   */
  public static fromString(addressString: string): Address {
    // Basic parsing - in production, use a proper address parsing service
    const parts = addressString.split(',').map((part) => part.trim());

    if (parts.length < 3) {
      throw new Error(
        'Address string must contain at least street, city, and state',
      );
    }

    const streetAddress = parts[0];
    const city = parts[1];
    const stateAndPostal = parts[2].split(' ');
    const state = stateAndPostal.slice(0, -1).join(' ');
    const postalCode = stateAndPostal[stateAndPostal.length - 1];
    const country = parts.length > 3 ? parts[3] : Address.DEFAULT_COUNTRY;

    return new Address(streetAddress, city, state, postalCode, country);
  }
  /**
   * Normalizes street address
   */
  private static normalizeStreetAddress(streetAddress: string): string {
    return streetAddress
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
  }

  /**
   * Normalizes city name
   */
  private static normalizeCity(city: string): string {
    return city
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  /**
   * Normalizes state name
   */
  private static normalizeState(state: string): string {
    const normalized = state
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

    // Handle common abbreviations for Colombian states
    const stateAbbreviations: Record<string, string> = {
      ANT: 'Antioquia',
      ATL: 'Atlántico',
      BOL: 'Bolívar',
      BOY: 'Boyacá',
      CAL: 'Caldas',
      CAQ: 'Caquetá',
      CAS: 'Casanare',
      CAU: 'Cauca',
      CES: 'Cesar',
      COR: 'Córdoba',
      CUN: 'Cundinamarca',
      HUI: 'Huila',
      MAG: 'Magdalena',
      MET: 'Meta',
      NAR: 'Nariño',
      NSA: 'Norte de Santander',
      PUT: 'Putumayo',
      QUI: 'Quindío',
      RIS: 'Risaralda',
      SAN: 'Santander',
      SUC: 'Sucre',
      TOL: 'Tolima',
      VAC: 'Valle del Cauca',
    };

    return stateAbbreviations[normalized] || normalized;
  }

  /**
   * Normalizes postal code
   */
  private static normalizePostalCode(postalCode: string): string {
    return postalCode.replace(/\D/g, ''); // Remove non-digits
  }

  /**
   * Normalizes country name
   */
  private static normalizeCountry(country: string): string {
    const normalized = country
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());

    // Handle common country variations
    const countryVariations: Record<string, string> = {
      CO: 'Colombia',
      COL: 'Colombia',
      'Republic of Colombia': 'Colombia',
    };

    return countryVariations[normalized] || normalized;
  }
}
