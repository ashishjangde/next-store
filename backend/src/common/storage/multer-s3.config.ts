import { Injectable, Logger } from '@nestjs/common';
import { S3Service } from './s3.service';
import ConfigService from '../config/config.service';
import { uploadConfig } from '../config/upload.config';
import { generateFileName } from '../utils/file-upload.util';
import { PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class MulterS3ConfigService {
  private readonly logger = new Logger(MulterS3ConfigService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {}

  async deleteFile(fileUrl: string): Promise<boolean> {
    try {
      return await this.s3Service.deleteFile(fileUrl);
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      return false;
    }
  }

  createMulterOptions(uploadType: keyof typeof uploadConfig) {
    const config = uploadConfig[uploadType];
    const bucketName = this.configService.get('S3_BUCKET_NAME');
    const s3Client = this.s3Service.s3Client;

    return {
      limits: {
        fileSize: config.maxSize,
      },
      fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
        if (!file.originalname.match(config.allowedTypes)) {
          return cb(new Error(config.errorMessage), false);
        }
        cb(null, true);
      },
      storage: {
        _handleFile: async (req: any, file: Express.Multer.File, cb: any) => {
          try {
            this.logger.debug(`Starting file upload to S3: ${file.originalname}`);
            
            const buffer = file.buffer || await this.readFileBuffer(file);
            const fileName = generateFileName(file.originalname);
            const uploadPath = `${uploadType}/${fileName}`;

            const command = new PutObjectCommand({
              Bucket: bucketName,
              Key: uploadPath,
              Body: buffer,
              ContentType: file.mimetype,
            });

            await s3Client.send(command);
            const fileUrl = this.s3Service.getFileUrl(uploadPath);

            cb(null, {
              filename: fileName,
              path: uploadPath,
              url: fileUrl,
            });
          } catch (error) {
            this.logger.error(`File upload failed: ${error.message}`, error.stack);
            cb(error);
          }
        },
        _removeFile: async (req: any, file: any, cb: any) => {
          cb(null);
        },
      },
    };
  }

  private async readFileBuffer(file: Express.Multer.File): Promise<Buffer> {
    if (file.buffer) return file.buffer;

    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      file.stream.on('data', (chunk) => chunks.push(chunk));
      file.stream.on('end', () => resolve(Buffer.concat(chunks)));
      file.stream.on('error', reject);
    });
  }
}
