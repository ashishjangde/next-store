import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

export function ApiFile(fileName: string = 'file') {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
}
