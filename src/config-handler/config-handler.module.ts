import { Module } from '@nestjs/common';
import { ConfigHandlerService } from './config-handler.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [ConfigHandlerService],
  exports: [ConfigHandlerService],
})
export class ConfigHandlerModule {}
