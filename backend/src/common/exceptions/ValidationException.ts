import { BadRequestException } from '@nestjs/common';

export class ValidationException extends BadRequestException {
  constructor(errors: Record<string, string>) {
    const response = {
      statusCode: 400,
      message: 'Validation failed',
      errors: errors,
      isValidationError: true, // Add a flag to identify validation errors
    };
    super(response);
  }
}
