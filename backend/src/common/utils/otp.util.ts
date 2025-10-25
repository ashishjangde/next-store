import * as crypto from 'crypto';

export class OtpUtil {

  static generateOtp(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(crypto.randomInt(0, digits.length))];
    }

    return otp;
  }


  static getExpirationTime(minutes: number): Date {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + minutes);
    return expiration;
  }


  static isValid(expirationTime: Date): boolean {
    return new Date() < expirationTime;
  }
}
