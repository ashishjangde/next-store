import { Global, Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { MulterS3ConfigService } from './multer-s3.config';
import ConfigService from '../config/config.service';

@Global()
@Module({
  providers: [S3Service, MulterS3ConfigService, ConfigService],
  exports: [S3Service, MulterS3ConfigService],
})
export class StorageModule {}
