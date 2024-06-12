import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { createMap, Mapper } from '@automapper/core';
import { AuthCredentialDto } from './auth/dto/auth-credential.dto';
import { Driver } from './dao/entity/Driver';
import {
  DriverDTO, FileDTO,
  PartnerDTO,
  RelRideDriverDTO,
  RideDTO,
  RideSurveyResultDTO, SurveyDResultTypeDTO,
  WorkOrderDTO,
} from './dao/dto/workorder.dto';
import { WorkOrder } from './dao/entity/WorkOrder';
import { Partner } from './dao/entity/Partner';
import { Ride } from './dao/entity/Ride';
import { RelRideDriver } from './dao/entity/RelRideDriver';
import { RideSurveyResult } from './dao/entity/RideSurveyResult';
import { File } from './dao/entity/File';
import { SurveyDResultType } from './dao/entity/SurveyDResultType';

@Injectable()
export class MapperProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper: Mapper) => {
      createMap(mapper, AuthCredentialDto, Driver);
      createMap(mapper, WorkOrder, WorkOrderDTO);
      createMap(mapper, Partner, PartnerDTO);
      createMap(mapper, Ride, RideDTO);
      createMap(mapper, RelRideDriver, RelRideDriverDTO);
      createMap(mapper, Driver, DriverDTO);
      createMap(mapper, WorkOrderDTO, WorkOrder);
      createMap(mapper, RideDTO, Ride);
      createMap(mapper, PartnerDTO, Partner);
      createMap(mapper, RelRideDriverDTO, RelRideDriver);
      createMap(mapper, DriverDTO, Driver);
      createMap(mapper, RideSurveyResult, RideSurveyResultDTO);
      createMap(mapper, RideSurveyResultDTO, RideSurveyResult);
      createMap(mapper, File, FileDTO);
      createMap(mapper, FileDTO, File);
      createMap(mapper, RideSurveyResult, RideSurveyResultDTO);
      createMap(mapper, RideSurveyResultDTO, RideSurveyResult);
      createMap(mapper, SurveyDResultType, SurveyDResultTypeDTO);
      createMap(mapper, SurveyDResultTypeDTO, SurveyDResultType);
    };
  }
}
