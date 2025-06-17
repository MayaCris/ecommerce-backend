import { ValueObject } from '../base-value-object';
import { CardType } from '../../enums/card-type.enum';

export interface CardNumberProps {
  number: string;
  type: CardType;
  maskedNumber: string;
  last4Digits: string;
}

/**
 * CardNumber Value Object
 * Handles credit card numbers with security, validation, and PCI DSS compliance
 */
export class CardNumber extends ValueObject<CardNumberProps> {
  private static readonly MIN_LENGTH = 13;
  private static readonly MAX_LENGTH = 19;

  // Card type patterns (BIN ranges)
  private static readonly CARD_PATTERNS = {
    [CardType.VISA]: /^4[0-9]{12}(?:[0-9]{3})?$/,
    [CardType.MASTERCARD]: /^5[1-5][0-9]{14}$/,
    [CardType.AMEX]: /^3[47][0-9]{13}$/,
  };

  constructor(cardNumber: string) {
    const sanitizedNumber = CardNumber.sanitizeCardNumber(cardNumber);
    const detectedType = CardNumber.detectCardType(sanitizedNumber);
    const last4 = CardNumber.extractLast4Digits(sanitizedNumber);
    const masked = CardNumber.maskCardNumber(sanitizedNumber);

    const props: CardNumberProps = {
      number: sanitizedNumber,
      type: detectedType,
      maskedNumber: masked,
      last4Digits: last4,
    };

    super(props);
    this.validate(props);
  }

  protected validate(value: CardNumberProps): void {
    if (!value.number || typeof value.number !== 'string') {
      throw new Error('Card number is required and must be a string');
    }

    // Length validation
    if (
      value.number.length < CardNumber.MIN_LENGTH ||
      value.number.length > CardNumber.MAX_LENGTH
    ) {
      throw new Error(
        `Card number length must be between ${CardNumber.MIN_LENGTH} and ${CardNumber.MAX_LENGTH} digits`,
      );
    }

    // Only digits validation
    if (!/^\d+$/.test(value.number)) {
      throw new Error('Card number must contain only digits');
    }

    // Luhn algorithm validation
    if (!this.isValidLuhn(value.number)) {
      throw new Error('Invalid card number - failed Luhn algorithm validation');
    }

    // Card type specific validation
    if (
      value.type !== CardType.OTHER &&
      !this.isValidForCardType(value.number, value.type)
    ) {
      throw new Error(`Invalid card number format for ${value.type}`);
    }
  }

  /**
   * Gets the masked card number (e.g., "**** **** **** 1234")
   */
  public getMaskedNumber(): string {
    return this._value.maskedNumber;
  }

  /**
   * Gets the card type (VISA, MASTERCARD, AMEX, OTHER)
   */
  public getType(): CardType {
    return this._value.type;
  }

  /**
   * Gets the last 4 digits of the card
   */
  public getLast4Digits(): string {
    return this._value.last4Digits;
  }

  /**
   * Checks if the card number is valid
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
   * Gets a formatted card number for display (with spaces every 4 digits)
   * Only for testing/development - never use full number in production
   */
  public getFormattedNumber(): string {
    // In production, this should never return the full number
    // This is only for development/testing purposes
    return this._value.number.replace(/(.{4})/g, '$1 ').trim();
  }

  /**
   * Sanitizes the card number by removing spaces, dashes, and other non-digit characters
   */
  private static sanitizeCardNumber(cardNumber: string): string {
    return cardNumber.replace(/\D/g, '');
  }

  /**
   * Detects the card type based on the card number
   */
  private static detectCardType(cardNumber: string): CardType {
    for (const [type, pattern] of Object.entries(CardNumber.CARD_PATTERNS)) {
      if (pattern.test(cardNumber)) {
        return type as CardType;
      }
    }
    return CardType.OTHER;
  }

  /**
   * Extracts the last 4 digits of the card number
   */
  private static extractLast4Digits(cardNumber: string): string {
    return cardNumber.slice(-4);
  }

  /**
   * Masks the card number showing only the last 4 digits
   */
  private static maskCardNumber(cardNumber: string): string {
    const last4 = cardNumber.slice(-4);
    const maskedPart = '*'.repeat(cardNumber.length - 4);

    // Format with spaces every 4 characters
    const fullMasked = maskedPart + last4;
    return fullMasked.replace(/(.{4})/g, '$1 ').trim();
  }

  /**
   * Validates card number using Luhn algorithm
   */
  private isValidLuhn(cardNumber: string): boolean {
    let sum = 0;
    let shouldDouble = false;

    // Process digits from right to left
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber.charAt(i), 10);

      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  }

  /**
   * Validates if the card number matches the expected pattern for its type
   */
  private isValidForCardType(cardNumber: string, cardType: CardType): boolean {
    const pattern =
      CardNumber.CARD_PATTERNS[
        cardType as keyof typeof CardNumber.CARD_PATTERNS
      ];
    return pattern ? pattern.test(cardNumber) : true;
  }

  /**
   * Creates a CardNumber instance for testing purposes only
   * In production, use proper tokenization
   */
  public static createForTesting(cardNumber: string): CardNumber {
    return new CardNumber(cardNumber);
  }

  /**
   * Creates a CardNumber from stored last 4 digits and type
   * Used when reconstructing from database where full number is not stored
   */
  public static fromStoredData(
    last4Digits: string,
    cardType: CardType,
  ): Partial<CardNumber> {
    const maskedNumber = `**** **** **** ${last4Digits}`;

    return {
      getMaskedNumber: () => maskedNumber,
      getLast4Digits: () => last4Digits,
      getType: () => cardType,
      isValid: () => true,
    } as Partial<CardNumber>;
  }

  /**
   * Override toString to never expose the full card number
   */
  public toString(): string {
    return this.getMaskedNumber();
  }

  /**
   * Returns safe data for serialization (excludes full card number)
   */
  public toSafeJSON(): Omit<CardNumberProps, 'number'> {
    return {
      type: this._value.type,
      maskedNumber: this._value.maskedNumber,
      last4Digits: this._value.last4Digits,
    };
  }
}
