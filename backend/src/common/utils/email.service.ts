import { Injectable } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';
import ConfigService from '../config/config.service';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.getNumber('SMTP_PORT'),
      secure: this.configService.getBoolean('SMTP_SECURE'),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASSWORD'),
      },
    });
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    otp: string,
  ): Promise<boolean> {
    try {
      const appName = this.configService.get('APP_NAME') || 'Our App';
      await this.transporter.sendMail({
        from: `"${appName}" <${this.configService.get('SMTP_FROM')}>`,
        to,
        subject: `${appName} - Verify Your Email`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to ${appName}!</h2>
            <p>Hello ${name},</p>
            <p>Thank you for signing up. To verify your email address, please use the following code:</p>
            <div style="background-color: #f4f4f4; padding: 12px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
              ${otp}
            </div>
            <p>This code is valid for 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <p>Best regards,<br>${appName} Team</p>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    otp: string,
  ): Promise<boolean> {
    try {
      const appName = this.configService.get('APP_NAME') || 'Our App';
      await this.transporter.sendMail({
        from: `"${appName}" <${this.configService.get('SMTP_FROM')}>`,
        to,
        subject: `${appName} - Password Reset Request`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>${appName} - Password Reset</h2>
            <p>Hello ${name},</p>
            <p>We received a request to reset your password. Use the following code to complete the process:</p>
            <div style="background-color: #f4f4f4; padding: 12px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
              ${otp}
            </div>
            <p>This code is valid for 10 minutes.</p>
            <p>If you didn't request this, please secure your account.</p>
            <p>Best regards,<br>${appName} Team</p>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }
}
