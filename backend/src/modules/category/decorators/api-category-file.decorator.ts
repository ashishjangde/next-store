import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

export function ApiCategoryFile(fileName: string = 'image') {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'string',
            format: 'binary',
            description: 'Category image file',
          },
          name: {
            type: 'string',
            description: 'Category name',
            example: 'Men\'s T-Shirts',
          },
          description: {
            type: 'string', 
            description: 'Category description',
            example: 'All types of t-shirts for men including round neck, v-neck, and polo',
          },
          slug: {
            type: 'string',
            description: 'Category slug (URL-friendly version of the name)',
            example: 'mens-t-shirts',
          },
          is_featured: {
            type: 'boolean',
            description: 'Whether this category should be featured',
            example: false,
          },
          active: {
            type: 'boolean',
            description: 'Whether this category is active',
            example: true,
          },
          sort_order: {
            type: 'integer',
            description: 'The order in which to display this category',
            example: 1,
          }
        },
        required: ['name', 'slug'],
      },
    }),
  );
}

export function ApiCategoryUpdateFile(fileName: string = 'image') {
  return applyDecorators(
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          [fileName]: {
            type: 'string',
            format: 'binary',
            description: 'Category image file',
          },
          name: {
            type: 'string',
            description: 'Category name',
            example: 'Men\'s T-Shirts',
          },
          description: {
            type: 'string', 
            description: 'Category description',
            example: 'All types of t-shirts for men including round neck, v-neck, and polo',
          },
          slug: {
            type: 'string',
            description: 'Category slug (URL-friendly version of the name)',
            example: 'mens-t-shirts',
          },
          is_featured: {
            type: 'boolean',
            description: 'Whether this category should be featured',
            example: false,
          },
          active: {
            type: 'boolean',
            description: 'Whether this category is active',
            example: true,
          },
          sort_order: {
            type: 'integer',
            description: 'The order in which to display this category',
            example: 1,
          }
        },
      },
    }),
  );
}
