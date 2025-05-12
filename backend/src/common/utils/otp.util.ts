import * as crypto from 'crypto';

export class OtpUtil {
  /**
   * Generate a random numeric OTP with specified length
   */
  static generateOtp(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(crypto.randomInt(0, digits.length))];
    }

    return otp;
  }

  /**
   * Get expiration time N minutes from now
   */
  static getExpirationTime(minutes: number): Date {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + minutes);
    return expiration;
  }

  /**
   * Verify if a date is still valid (not expired)
   */
  static isValid(expirationTime: Date): boolean {
    return new Date() < expirationTime;
  }
}
