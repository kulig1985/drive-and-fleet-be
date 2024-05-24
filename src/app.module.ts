import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DaoModule } from './dao/dao.module';
import { ConfigHandlerModule } from './config-handler/config-handler.module';
import { configuration } from './env/configuration';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    DaoModule,
    ConfigHandlerModule,
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/src/env/${process.env.NODE_ENV}.env`,
      load: [configuration],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
