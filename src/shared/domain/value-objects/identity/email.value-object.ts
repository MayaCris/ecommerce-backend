import { ValueObject } from '../base-value-object';

/**
 * Email Value Object
 * Represents a valid email address
 */
export class Email extends ValueObject<string> {
  private static readonly EMAIL_REGEX =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  private static readonly MAX_LENGTH = 320; // RFC 5321 limit
  private static readonly MIN_LENGTH = 5; // a@b.c

  constructor(email: string) {
    const normalizedEmail = email.trim().toLowerCase();
    super(normalizedEmail);
    this.validate(normalizedEmail);
  }

  protected validate(value: string): void {
    if (!value || typeof value !== 'string') {
      throw new Error('Email cannot be empty');
    }

    if (value.length < Email.MIN_LENGTH) {
      throw new Error(
        `Email is too short. Minimum length is ${Email.MIN_LENGTH} characters`,
      );
    }

    if (value.length > Email.MAX_LENGTH) {
      throw new Error(
        `Email is too long. Maximum length is ${Email.MAX_LENGTH} characters`,
      );
    }

    if (!Email.EMAIL_REGEX.test(value)) {
      throw new Error(`Invalid email format: ${value}`);
    }

    // Additional validations
    if (value.startsWith('.') || value.endsWith('.')) {
      throw new Error('Email cannot start or end with a dot');
    }

    if (value.includes('..')) {
      throw new Error('Email cannot contain consecutive dots');
    }

    const [localPart, domain] = value.split('@');

    if (localPart.length > 64) {
      throw new Error('Email local part cannot exceed 64 characters');
    }

    if (domain.length > 253) {
      throw new Error('Email domain cannot exceed 253 characters');
    }
  }

  /**
   * Gets the email address
   */
  public get address(): string {
    return this._value;
  }

  /**
   * Gets the local part (before @)
   */
  public get localPart(): string {
    return this._value.split('@')[0];
  }

  /**
   * Gets the domain part (after @)
   */
  public get domain(): string {
    return this._value.split('@')[1];
  }

  /**
   * Checks if the email belongs to a specific domain
   */
  public belongsToDomain(domain: string): boolean {
    return this.domain === domain.toLowerCase();
  }

  /**
   * Checks if the email is from a free email provider
   */
  public isFreeEmailProvider(): boolean {
    const freeProviders = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'icloud.com',
      'aol.com',
      'live.com',
      'msn.com',
      'ymail.com',
      'rocketmail.com',
    ];

    return freeProviders.includes(this.domain);
  }

  /**
   * Creates an Email from string with validation
   */
  public static create(email: string): Email {
    return new Email(email);
  }

  /**
   * Returns the email address as string
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
