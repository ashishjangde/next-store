import { Global, Module } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';
import ConfigService from '../../config/config.service';

@Global()
@Module({
  providers: [ElasticsearchService, ConfigService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
