import { CardNumber } from '../../../../shared/domain/value-objects/payment/card-number.value-object';
import { CardType } from '../../../../shared/domain/enums/card-type.enum';

export interface CreditCardProps {
  number: string;
  cvc: string;
  expiryMonth: string;
  expiryYear: string;
  cardHolder: string;
}

export class CreditCard {
  private readonly _cardNumber: CardNumber;
  private readonly _cvc: string;
  private readonly _expiryMonth: string;
  private readonly _expiryYear: string;
  private readonly _cardHolder: string;

  constructor(props: CreditCardProps) {
    this.validate(props);

    this._cardNumber = new CardNumber(props.number);
    this._cvc = props.cvc;
    this._expiryMonth = this.formatMonth(props.expiryMonth);
    this._expiryYear = this.formatYear(props.expiryYear);
    this._cardHolder = props.cardHolder.trim().toUpperCase();
  }

  private validate(props: CreditCardProps): void {
    if (!props.cvc || !/^\d{3,4}$/.test(props.cvc)) {
      throw new Error('CVC must be 3 or 4 digits');
    }

    if (!props.expiryMonth || !/^(0?[1-9]|1[0-2])$/.test(props.expiryMonth)) {
      throw new Error('Expiry month must be between 01 and 12');
    }

    if (!props.expiryYear) {
      throw new Error('Expiry year is required');
    }

    const year = parseInt(props.expiryYear);
    const currentYear = new Date().getFullYear();

    if (year < currentYear || year > currentYear + 20) {
      throw new Error(
        'Expiry year must be between current year and 20 years from now',
      );
    }

    if (!props.cardHolder || props.cardHolder.trim().length < 2) {
      throw new Error('Card holder name must be at least 2 characters');
    }

    // Validate expiry date is not in the past
    const month = parseInt(props.expiryMonth);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYearFull = currentDate.getFullYear();

    if (year === currentYearFull && month < currentMonth) {
      throw new Error('Card has expired');
    }
  }

  private formatMonth(month: string): string {
    const monthNum = parseInt(month);
    return monthNum.toString().padStart(2, '0');
  }

  private formatYear(year: string): string {
    // Convert 2-digit year to 4-digit if necessary
    const yearNum = parseInt(year);
    if (yearNum < 100) {
      const currentYear = new Date().getFullYear();
      const currentCentury = Math.floor(currentYear / 100) * 100;
      return (currentCentury + yearNum).toString();
    }
    return yearNum.toString();
  }

  // Getters for safe access to card data
  public getMaskedNumber(): string {
    return this._cardNumber.getMaskedNumber();
  }

  public getLast4Digits(): string {
    return this._cardNumber.getLast4Digits();
  }

  public getCardType(): CardType {
    return this._cardNumber.getType();
  }

  public getCvc(): string {
    return this._cvc;
  }

  public getExpiryMonth(): string {
    return this._expiryMonth;
  }

  public getExpiryYear(): string {
    return this._expiryYear;
  }

  public getCardHolder(): string {
    return this._cardHolder;
  }
  // For External API integration - returns the raw number (use carefully)
  public getNumberForTokenization(): string {
    return this._cardNumber.value.number;
  }

  public isExpired(): boolean {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const cardYear = parseInt(this._expiryYear);
    const cardMonth = parseInt(this._expiryMonth);

    if (cardYear < currentYear) {
      return true;
    }

    if (cardYear === currentYear && cardMonth < currentMonth) {
      return true;
    }

    return false;
  }

  public toExternalApiTokenRequest(): {
    number: string;
    cvc: string;
    exp_month: string;
    exp_year: string;
    card_holder: string;
  } {
    return {
      number: this.getNumberForTokenization(),
      cvc: this._cvc,
      exp_month: this._expiryMonth,
      exp_year: this._expiryYear,
      card_holder: this._cardHolder,
    };
  }
}
