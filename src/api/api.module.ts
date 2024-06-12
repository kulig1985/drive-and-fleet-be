import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { PassportModule } from '@nestjs/passport';
import { DaoModule } from '../dao/dao.module';
import { ConfigHandlerModule } from '../config-handler/config-handler.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    DaoModule,
    ConfigHandlerModule,
  ],
  providers: [ApiService],
  controllers: [ApiController],
})
export class ApiModule {}
