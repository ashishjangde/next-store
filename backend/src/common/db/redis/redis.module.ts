import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import ConfigService from '../../config/config.service';

@Global()
@Module({
    providers: [RedisService, ConfigService],
    exports: [RedisService]
})
export class RedisModule{}