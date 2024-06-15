import { AutoMap } from '@automapper/classes';
import { IsNotEmpty } from 'class-validator';
import { SurveyDResultType } from '../entity/SurveyDResultType';
export class PartnerDTO {
  @AutoMap()
  partnerId: number;
  @AutoMap()
  partnerName: string;
  @AutoMap()
  partnerType: string;
  @AutoMap()
  partnerMail: string;
  @AutoMap()
  partnerPhone: string;
}

export class WorkOrderDTO {
  @AutoMap()
  orderId: number;
  @AutoMap()
  plateNr: string;
  @AutoMap()
  carType: string;
  @AutoMap()
  carUserName: string;
  @AutoMap()
  rideCnt: number;
  @AutoMap()
  commentText: string;
  @AutoMap()
  crDate: Date;
  @AutoMap()
  crUser: null;
  @AutoMap()
  modDate: Date;
  @AutoMap()
  modUser: null;
  @AutoMap()
  boolId: number;
  @AutoMap(() => [RideDTO])
  rides: RideDTO[];
  @AutoMap(() => PartnerDTO)
  partner: PartnerDTO;
}
export class DriverDTO {
  @AutoMap()
  driverId: number;
  @AutoMap()
  driverName: string;
  @AutoMap()
  driverRealName: string;
  @AutoMap()
  driverMail: string;
  @AutoMap()
  driverType: string;
}
export class RelRideDriverDTO {
  @AutoMap()
  ridrId: number;
  @AutoMap(() => DriverDTO)
  driver: DriverDTO;
}
export class RideDTO {
  @AutoMap()
  rideId: number;
  @AutoMap()
  orderId: number;
  @AutoMap()
  executeNr: number;
  @AutoMap()
  pickUpTime: Date;
  @AutoMap()
  @IsNotEmpty()
  startLocationZip: number;
  @AutoMap()
  @IsNotEmpty()
  startLocationCity: string;
  @AutoMap()
  @IsNotEmpty()
  startLocationAddress: string;
  @AutoMap()
  @IsNotEmpty()
  finishLocationZip: number;
  @AutoMap()
  @IsNotEmpty()
  finishLocationCity: string;
  @AutoMap()
  @IsNotEmpty()
  finishLocationAddress: string;
  @AutoMap()
  crDate: Date;
  @AutoMap()
  crUser: null;
  @AutoMap()
  modDate: Date;
  @AutoMap()
  modUser: string;
  @AutoMap()
  boolId: number;
  @AutoMap(() => [RelRideDriverDTO])
  relRideDrivers: RelRideDriverDTO[];
  @AutoMap(() => [WorkOrderDTO])
  order: WorkOrderDTO;
  @AutoMap(() => [FileDTO])
  files: FileDTO[];
  @AutoMap(() => [RideSurveyResultDTO])
  rideSurveyResults: RideSurveyResultDTO[];
}

export class SurveyDResultTypeDTO {
  @AutoMap()
  stypeId: number;
  @AutoMap()
  typeName: string;
}

export class RideSurveyResultDTO {
  @AutoMap()
  sureId: number;
  @AutoMap()
  survValue: string | null;
  @AutoMap()
  crDate: Date | null;
  @AutoMap()
  crUser: string | null;
  @AutoMap()
  modDate: Date | null;
  @AutoMap()
  modUser: string | null;
  @AutoMap()
  boolId: number | null;
  @AutoMap(() => SurveyDResultTypeDTO)
  stype: SurveyDResultTypeDTO;
}
export class FileDTO {
  @AutoMap()
  fileId: number;
  @AutoMap()
  fileName: string | null;
  @AutoMap()
  filePath: string | null;
  @AutoMap()
  fileType: string | null;
  @AutoMap()
  crDate: Date | null;
  @AutoMap()
  crUser: string | null;
  @AutoMap()
  modDate: Date | null;
  @AutoMap()
  modUser: string | null;
  @AutoMap()
  boolId: number | null;
}
