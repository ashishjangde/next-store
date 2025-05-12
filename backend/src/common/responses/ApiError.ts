import { ApiProperty } from '@nestjs/swagger';

class ApiError {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  errors?: Record<string, string> | string[];

  constructor(
    statusCode: number,
    message: string,
    errors?: Record<string, string> | string[],
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
  }
}

export default ApiError;


export const ApiCustomErrorResponse = (
    statusCode: number,
    defaultMessage: string,
  ) => ({
    type: 'object',
    properties: {
      localDateTime: {
        type: 'string',
        format: 'date-time',
      },
      data: {
        type: 'null',
      },
      apiError: {
        type: 'object',
        properties: {
          statusCode: {
            type: 'number',
            example: statusCode,
          },
          message: {
            type: 'string',
            example: defaultMessage,
          },
          errors: {
            oneOf: [
              {
                type: 'object',
                additionalProperties: { type: 'string' },
              },
              {
                type: 'array',
                items: { type: 'string' },
              },
            ],
            example: { field: 'error message' },
          },
        },
      },
    },
  });
  