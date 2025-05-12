import { BadRequestException } from '@nestjs/common';

export class ValidationException extends BadRequestException {
  constructor(errors: Record<string, string>) {
    const response = {
      statusCode: 400,
      message: 'Validation failed',
      errors: errors,
    };
    super(response);
  }
}
