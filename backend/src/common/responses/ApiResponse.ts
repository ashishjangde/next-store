import ApiError from './ApiError';
import { ApiProperty, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';

@ApiExtraModels()
class ApiResponse<T> {
  @ApiProperty({ example: new Date() })
  localDateTime: Date;

  @ApiProperty({
    required: true,
    nullable: true,
    description: 'Response data',
  })
  data: T | null;

  @ApiProperty({
    type: ApiError,
    nullable: true,
    required: false,
  })
  apiError?: ApiError | [] | null;

  constructor(data: T, apiError?: ApiError) {
    this.localDateTime = new Date();

    if (data) {
      this.data = data;
      this.apiError = undefined;
    } else {
      this.data = null;
      this.apiError = apiError || undefined;
    }
  }
}

export default ApiResponse;

export const ApiCustomResponse = (
  model: Function | Record<string, any> | Array<any>,
) => {
  const isClass = typeof model === 'function';
  
  return {
    allOf: [
      {
        type: 'object',
        required: ['localDateTime', 'data'],
        properties: {
          localDateTime: {
            type: 'string',
            format: 'date-time',
          },
          data: isClass
            ? { $ref: getSchemaPath(model) }
            : Array.isArray(model) && model.length > 0
              ? {
                  type: 'array',
                  items: { $ref: getSchemaPath(model[0]) },
                }
              : {
                  type: 'object',
                  properties: Object.entries(model).reduce(
                    (acc, [key, value]) => ({
                      ...acc,
                      [key]: Array.isArray(value) && value.length > 0
                        ? {
                            type: 'array',
                            items: { $ref: getSchemaPath(value[0]) },
                          }
                        : {
                            type: typeof value,
                            example: value,
                          },
                    }),
                    {},
                  ),
                },
          apiError: {
            type: 'null',
          },
        },
      },
    ],
  };
};
