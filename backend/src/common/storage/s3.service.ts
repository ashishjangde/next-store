import { Injectable, Logger } from '@nestjs/common';
import { 
  S3Client, 
  DeleteObjectCommand, 
  PutObjectCommand,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import ConfigService from '../config/config.service';
import { generateFileName } from '../utils/file-upload.util';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  public readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly endpoint: string;

  constructor(private readonly configService: ConfigService) {
    this.bucketName = this.configService.get('S3_BUCKET_NAME');
    const rawEndpoint = this.configService.get('S3_ENDPOINT');
    this.endpoint = rawEndpoint?.replace(/^https?:\/\//, ''); // sanitize for later use

    
    const endpointUrl = new URL(`https://${this.endpoint}`);
    const host = endpointUrl.host;
    
    // Get region from config or extract from endpoint
    const region = this.configService.get('S3_REGION') || host.split('.')[1] || 'us-east-1';

    this.logger.debug(`Initializing S3 client with: 
      Bucket: ${this.bucketName}
      Host: ${host}
      Region: ${region}
    `);

    const config: S3ClientConfig = {
      endpoint: `https://${host}`,
      region,
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get('S3_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
      useAccelerateEndpoint: false,
      useArnRegion: false,
    };

    this.s3Client = new S3Client(config);
    

    this.logger.log(`S3 client initialized with endpoint: ${host}`);
  }

  getFileUrl(key: string): string {
    return `https://${this.endpoint}/${this.bucketName}/${key}`;
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const key = urlObj.pathname.replace(`/${this.bucketName}/`, '');
      this.logger.debug(`Extracted key for deletion: ${key}`);
      return key;
    } catch (error) {
      this.logger.error(`Invalid URL format: ${url}`);
      return null;
    }
  }
  

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      const fileName = generateFileName(file.originalname);
      const uploadPath = `${folder}/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: uploadPath,
        Body: file.buffer,
        ContentType: file.mimetype,
      });

      await this.s3Client.send(command);
      return this.getFileUrl(uploadPath);
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw error;
    }
  }

  async deleteFile(url: string): Promise<boolean> {
    try {
      const key = this.extractKeyFromUrl(url);
      if (!key) return false;

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete file: ${error.message}`, error.stack);
      return false;
    }
  }

}
