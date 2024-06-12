import { Module } from '@nestjs/common';
import { DaoService } from './dao.service';
import { DaoController } from './dao.controller';
import { ConfigHandlerModule } from '../config-handler/config-handler.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigHandlerService } from '../config-handler/config-handler.service';
import { Driver } from './entity/Driver';
import { File } from './entity/File';
import { Partner } from './entity/Partner';
import { RelRideDriver } from './entity/RelRideDriver';
import { Ride } from './entity/Ride';
import { PassportModule } from '@nestjs/passport';
import { WorkOrder } from './entity/WorkOrder';
import { SurveyDResultType } from './entity/SurveyDResultType';
import { RideSurveyResult } from './entity/RideSurveyResult';

@Module({
  imports: [
    ConfigHandlerModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigHandlerModule],
      inject: [ConfigHandlerService],
      name: 'driveAndFleetMySql',
      useFactory: async (configHandlerService: ConfigHandlerService) => ({
        type: 'mysql',
        host: configHandlerService.get('mysql', 'host'),
        port: Number(configHandlerService.get('mysql', 'port')),
        username: configHandlerService.get('mysql', 'username'),
        password: configHandlerService.get('mysql', 'password'),
        database: configHandlerService.get('mysql', 'database'),
        entities: [
          Driver,
          Partner,
          RelRideDriver,
          Ride,
          WorkOrder,
          File,
          SurveyDResultType,
          RideSurveyResult,
        ],
        //logging: ["query"],
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature(
      [
        Driver,
        Partner,
        RelRideDriver,
        Ride,
        WorkOrder,
        File,
        SurveyDResultType,
        RideSurveyResult,
      ],
      'driveAndFleetMySql',
    ),
  ],
  providers: [DaoService],
  controllers: [DaoController],
  exports: [DaoService],
})
export class DaoModule {}
