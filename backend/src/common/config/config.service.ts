import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';

@Injectable()
class ConfigService {
  private readonly envConfig: Record<string, string | undefined>;
  private readonly logger = new Logger(ConfigService.name);

  constructor() {
    dotenv.config(); // Load .env file
    this.envConfig = process.env;
  }



  get(key: string): string {
    const value = this.envConfig[key];
    if (value === undefined) {
      this.logger.warn(`Configuration key "${key}" not found`);
      return '';
    }
    return value;
  }

  getNumber(key: string): number {
    const value = this.get(key);
    const parsed = value ? Number(value) : 0;
    if (isNaN(parsed)) {
      this.logger.warn(`Configuration key "${key}" is not a valid number`);
      return 0;
    }
    return parsed;
  }

  getBoolean(key: string): boolean {
    const value = this.get(key).toLowerCase();
    return value === 'true' || value === '1';
  }
}

export default ConfigService;
