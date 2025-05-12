import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import ConfigService from '../../config/config.service';

interface PipelineItem {
  key: string;
  value: any;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly DEFAULT_TTL = 120; 
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.getNumber('REDIS_PORT'),
      password: this.configService.get('REDIS_PASSWORD'),
      lazyConnect: true, 
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis Error:', err);
    });

    this.client.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
    } catch (error) {
      if (error.message !== 'Redis is already connecting/connected') {
        this.logger.error('Failed to connect to Redis:', error);
        throw error;
      }
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async set(key: string, value: any, ttl: number = this.DEFAULT_TTL): Promise<void> {
    const serializedValue = JSON.stringify(value);
    await this.client.setex(key, ttl, serializedValue);
  }

  async get<T>(key: string, refresh: boolean = true): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    
    // Refresh TTL if requested
    if (refresh) {
      await this.refresh(key);
    }
    
    return JSON.parse(value) as T;
  }

  async refresh(key: string): Promise<void> {
    const ttl = await this.client.ttl(key);
    if (ttl > 0) {
      await this.client.expire(key, this.DEFAULT_TTL);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async flushAll(): Promise<void> {
    await this.client.flushall();
  }

  async pipeline(items: PipelineItem[]): Promise<void> {
    const pipeline = this.client.pipeline();
    
    items.forEach(item => {
      const serializedValue = JSON.stringify(item.value);
      pipeline.setex(item.key, this.DEFAULT_TTL, serializedValue);
    });

    await pipeline.exec();
  }

  async pipelineDel(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    const pipeline = this.client.pipeline();
    keys.forEach(key => pipeline.del(key));
    await pipeline.exec();
  }
}
