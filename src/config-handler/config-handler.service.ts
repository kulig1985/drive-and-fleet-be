import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ConfigHandlerService {
  private readonly logger = new Logger(ConfigHandlerService.name);
  private readonly config: any;

  constructor(private configService: ConfigService) {
    const configPath = this.configService.get('CONFIG_PATH');
    let configFile: string;

    try {
      configFile = fs.readFileSync(configPath, 'utf8');
    } catch (err) {
      throw new Error(
        `Failed to load configuration file from ${configPath}: ${err.message}`,
      );
    }

    this.config = JSON.parse(configFile);
    //this.logger.log('config', this.config);
  }

  get(module: string, key: string): any {
    return this.config[module][key];
  }
}
