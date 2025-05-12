
import { extname } from 'path';
import { uploadConfig } from '../config/upload.config';

export interface UploadOptions {
  fieldName: string;
  uploadType: keyof typeof uploadConfig;
  customDestination?: string;
  customFileName?: (originalname: string) => string;
}

export const generateFileName = (originalname: string): string => {
  const randomName = Array(32)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  return `${randomName}${extname(originalname)}`;
};
