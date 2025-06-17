import { ValueObject } from '../base-value-object';
import { CardType } from '../../enums/card-type.enum';

export interface CVVProps {
  value: string;
  cardType: CardType;
  length: number;
}

/**
 * CVV Value Object
 * Handles credit card verification value validation
 * SECURITY: Never store CVV values - only validate them
 */
export class CVV extends ValueObject<CVVProps> {
  private static readonly VISA_MASTERCARD_LENGTH = 3;
  private static readonly AMEX_LENGTH = 4;
  private static readonly MIN_LENGTH = 3;
  private static readonly MAX_LENGTH = 4;

  constructor(cvvValue: string, cardType: CardType = CardType.OTHER) {
    const normalizedValue = CVV.normalizeCVV(cvvValue);
    const props: CVVProps = {
      value: normalizedValue,
      cardType,
      length: normalizedValue.length,
    };

    super(props);
    this.validate(props);
  }

  protected validate(value: CVVProps): void {
    if (!value.value || typeof value.value !== 'string') {
      throw new Error('CVV is required and must be a string');
    }

    // Check if contains only digits
    if (!/^\d+$/.test(value.value)) {
      throw new Error('CVV must contain only digits');
    }

    // Length validation
    if (value.length < CVV.MIN_LENGTH || value.length > CVV.MAX_LENGTH) {
      throw new Error(
        `CVV must be between ${CVV.MIN_LENGTH} and ${CVV.MAX_LENGTH} digits`,
      );
    }

    // Card type specific validation
    this.validateCVVForCardType(value.value, value.cardType);
  }

  /**
   * Gets the CVV value (use carefully - for validation only)
   */
  public getValue(): string {
    return this._value.value;
  }

  /**
   * Gets the associated card type
   */
  public getCardType(): CardType {
    return this._value.cardType;
  }

  /**
   * Gets the CVV length
   */
  public getLength(): number {
    return this._value.length;
  }

  /**
   * Checks if CVV is valid for the card type
   */
  public isValidForCardType(): boolean {
    try {
      this.validateCVVForCardType(this._value.value, this._value.cardType);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets a masked version for logging (never log actual CVV)
   */
  public getMaskedValue(): string {
    return '*'.repeat(this._value.length);
  }

  /**
   * Validates CVV format only (does not verify authenticity)
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
   * Creates CVV for VISA/MasterCard (3 digits)
   */
  public static createForVisaMasterCard(cvvValue: string): CVV {
    const cardType =
      cvvValue.length === CVV.VISA_MASTERCARD_LENGTH
        ? CardType.VISA
        : CardType.OTHER;
    return new CVV(cvvValue, cardType);
  }

  /**
   * Creates CVV for American Express (4 digits)
   */
  public static createForAmex(cvvValue: string): CVV {
    return new CVV(cvvValue, CardType.AMEX);
  }

  /**
   * Validates CVV format without creating instance
   */
  public static isValidFormat(cvvValue: string, cardType?: CardType): boolean {
    try {
      new CVV(cvvValue, cardType);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets expected CVV length for card type
   */
  public static getExpectedLength(cardType: CardType): number {
    switch (cardType) {
      case CardType.AMEX:
        return CVV.AMEX_LENGTH;
      case CardType.VISA:
      case CardType.MASTERCARD:
        return CVV.VISA_MASTERCARD_LENGTH;
      default:
        return CVV.VISA_MASTERCARD_LENGTH; // Default to most common
    }
  }

  /**
   * Normalizes CVV by removing non-digit characters
   */
  private static normalizeCVV(cvvValue: string): string {
    return cvvValue.replace(/\D/g, '');
  }

  /**
   * Validates CVV for specific card type
   */
  private validateCVVForCardType(cvvValue: string, cardType: CardType): void {
    const expectedLength = CVV.getExpectedLength(cardType);

    if (cvvValue.length !== expectedLength) {
      const cardTypeName =
        cardType === CardType.AMEX ? 'American Express' : 'Visa/MasterCard';
      throw new Error(
        `${cardTypeName} CVV must be exactly ${expectedLength} digits. Got: ${cvvValue.length}`,
      );
    }
  }

  /**
   * Override toString to never expose actual CVV
   */
  public toString(): string {
    return this.getMaskedValue();
  }
  /**
   * Returns safe data for serialization (excludes actual CVV value)
   */
  public toSafeJSON(): Omit<CVVProps, 'value'> {
    return {
      cardType: this._value.cardType,
      length: this._value.length,
    };
  }

  /**
   * Security method: Clear CVV from memory
   * Call this after validation to ensure CVV doesn't remain in memory
   */
  public clearFromMemory(): void {
    // In a real implementation, you might want to overwrite memory
    // This is a symbolic method to indicate security intent
    Object.defineProperty(this, '_value', {
      value: {
        value: '',
        cardType: this._value.cardType,
        length: 0,
      },
      writable: false,
    });
  }
}
