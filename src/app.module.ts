import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DaoModule } from './dao/dao.module';
import { ConfigHandlerModule } from './config-handler/config-handler.module';
import { configuration } from './env/configuration';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { ApiModule } from './api/api.module';
import { PublicController } from './public/public.controller';
import { PublicService } from './public/public.service';

@Module({
  imports: [
    DaoModule,
    ConfigHandlerModule,
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/src/env/${process.env.NODE_ENV}.env`,
      load: [configuration],
    }),
    AuthModule,
    AutomapperModule.forRoot({
      strategyInitializer: classes(),
    }),
    ApiModule,
  ],
  controllers: [AppController, PublicController],
  providers: [AppService, PublicService],
})
export class AppModule {}
