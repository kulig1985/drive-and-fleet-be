import { SaveFilePathResultDto } from '../../dao/dto/save-file-path-result.dto';
import { RideSurveyResultDto } from '../../dao/dto/ride-survey-result.dto';
import { Ride } from '../../dao/entity/Ride';
import { WorkOrder } from '../../dao/entity/WorkOrder';

export interface HandleUploadResultDto {
  entitySaveResult: SaveFilePathResultDto;
  rideSurveyResult: RideSurveyResultDto;
  finalisedRide: Ride;
  finalisedWorkOrder: WorkOrder;
}
