import { Injectable, Logger } from '@nestjs/common';
import { ConfigHandlerService } from '../config-handler/config-handler.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from './entity/Driver';
import { Repository } from 'typeorm';
import { Partner } from './entity/Partner';
import { RelRideDriver } from './entity/RelRideDriver';
import { Ride } from './entity/Ride';
import { WorkOrder } from './entity/WorkOrder';
import { SaveFileResultDto } from '../api/dto/save-file-result.dto';
import { File } from './entity/File';
import { basename } from 'path';
import { SaveSurveyResultDto } from '../api/dto/save-survey-result.dto';
import { SurveyDResultType } from './entity/SurveyDResultType';
import { RideSurveyResult } from './entity/RideSurveyResult';
import { SaveFilePathResultDto } from './dto/save-file-path-result.dto';
import { RideSurveyResultDto } from './dto/ride-survey-result.dto';
import {
  DriverDTO,
  PartnerDTO,
  RideDTO,
  WorkOrderDTO,
} from './dto/workorder.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Between } from 'typeorm';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class DaoService {
  private readonly logger = new Logger(DaoService.name);
  constructor(
    private configHandlerService: ConfigHandlerService,
    @InjectMapper() private readonly classMapper: Mapper,
    @InjectRepository(Driver, 'driveAndFleetMySql')
    readonly driverRepository: Repository<Driver>,
    @InjectRepository(Partner, 'driveAndFleetMySql')
    readonly partnerRepository: Repository<Partner>,
    @InjectRepository(RelRideDriver, 'driveAndFleetMySql')
    readonly relRideDriverRepository: Repository<RelRideDriver>,
    @InjectRepository(Ride, 'driveAndFleetMySql')
    readonly rideRepository: Repository<Ride>,
    @InjectRepository(WorkOrder, 'driveAndFleetMySql')
    readonly workOrderRepository: Repository<WorkOrder>,
    @InjectRepository(File, 'driveAndFleetMySql')
    readonly fileRepository: Repository<File>,
    @InjectRepository(SurveyDResultType, 'driveAndFleetMySql')
    readonly surveyDResultTypeRepository: Repository<SurveyDResultType>,
    @InjectRepository(RideSurveyResult, 'driveAndFleetMySql')
    readonly rideSurveyResultRepository: Repository<RideSurveyResult>,
  ) {}

  async findAllWorkOrder(): Promise<WorkOrderDTO[]> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const workOrderList = await this.workOrderRepository.find({
      where: [
        {
          crDate: Between(todayStart, todayEnd),
        },
        {
          boolId: 1,
        },
      ],
      order: {
        boolId: 'ASC',
        orderId: 'ASC',
      },
    });
    this.logger.log('workOrderList length: ' + workOrderList.length);
    return workOrderList.map((workOrderInstance) =>
      this.classMapper.map(workOrderInstance, WorkOrder, WorkOrderDTO),
    );
  }

  async findAllValidPartner(): Promise<PartnerDTO[]> {
    const partnerList = await this.partnerRepository.findBy({ boolId: 1 });
    this.logger.log('partnerList length: ' + partnerList.length);
    return partnerList.map((partnerInstance) =>
      this.classMapper.map(partnerInstance, Partner, PartnerDTO),
    );
  }

  async findAllDriver(): Promise<DriverDTO[]> {
    const driverList = await this.driverRepository.findBy({
      driverType: 'BASE',
      boolId: 1,
    });
    this.logger.log('driverList length: ' + driverList.length);
    return driverList.map((driverInstance) =>
      this.classMapper.map(driverInstance, Driver, DriverDTO),
    );
  }

  async findWorkOrderById(orderId: number): Promise<WorkOrder> {
    return this.workOrderRepository.findOneBy({ orderId: orderId });
  }

  async saveFilePaths(
    savedFiles: SaveFileResultDto,
    ride: Ride,
    driverName: string,
  ): Promise<SaveFilePathResultDto> {
    const fileEntitiesToSave: File[] = [];

    savedFiles.savedFiles.forEach((savedFile: string) => {
      const fileEntityInstance = new File();
      fileEntityInstance.rideId = ride.rideId;
      fileEntityInstance.fileName = basename(savedFile);
      fileEntityInstance.filePath = savedFile;
      fileEntityInstance.fileType = 'pic';
      fileEntityInstance.crUser = driverName;
      fileEntitiesToSave.push(fileEntityInstance);
    });

    const fileEntityInstanceForSignature = new File();
    fileEntityInstanceForSignature.rideId = ride.rideId;
    fileEntityInstanceForSignature.fileName = basename(
      savedFiles.signaturePath,
    );
    fileEntityInstanceForSignature.filePath = savedFiles.signaturePath;
    fileEntityInstanceForSignature.fileType = 'sign';
    fileEntityInstanceForSignature.crUser = driverName;
    fileEntitiesToSave.push(fileEntityInstanceForSignature);

    const savedFileEntities: File[] =
      await this.fileRepository.save(fileEntitiesToSave);

    return { savedFileEntities };
  }

  async saveSurveyResult(
    saveSurveyDto: SaveSurveyResultDto,
    ride: Ride,
    driverName: string,
  ): Promise<RideSurveyResultDto> {
    this.logger.log(
      `saveSurveyResult invoked with ride: ${ride.rideId} driverName: ${driverName}`,
    );

    const types = ['kmAmount', 'fuelLevel', 'equipmentsList'];
    const surveyDResultToSave = await Promise.all(
      types.map((typeName) =>
        this.surveyDResultTypeRepository.findOneBy({ typeName }),
      ),
    );

    const rideSurveyResultList: RideSurveyResult[] =
      surveyDResultToSave.flatMap((surveyDResultInstance) => {
        if (!surveyDResultInstance) return [];

        switch (surveyDResultInstance.typeName) {
          case 'kmAmount':
            return [
              {
                ride,
                stype: surveyDResultInstance,
                survValue: String(saveSurveyDto.kmAmount),
                crUser: driverName,
              } as RideSurveyResult,
            ];

          case 'fuelLevel':
            return [
              {
                ride,
                stype: surveyDResultInstance,
                survValue: String(saveSurveyDto.fuelLevel),
                crUser: driverName,
              } as RideSurveyResult,
            ];

          case 'equipmentsList':
            return saveSurveyDto.equipmentsList.map(
              (equipment) =>
                ({
                  ride,
                  stype: surveyDResultInstance,
                  survValue: equipment,
                  crUser: driverName,
                }) as RideSurveyResult,
            );

          default:
            return [];
        }
      });
    const rideSurveyResult =
      await this.rideSurveyResultRepository.save(rideSurveyResultList);
    return { rideSurveyResult };
  }

  async makeRideFinished(ride: Ride, driverName: string): Promise<Ride> {
    ride.boolId = 2;
    ride.modDate = new Date();
    ride.modUser = driverName;
    return this.rideRepository.save(ride);
  }

  async makeWorkOrderFinished(
    workOrder: WorkOrder,
    driverName: string,
  ): Promise<WorkOrder> {
    workOrder.boolId = 2;
    workOrder.modDate = new Date();
    workOrder.modUser = driverName;
    return this.workOrderRepository.save(workOrder);
  }

  async findRideById(rideId: number): Promise<RideDTO> {
    const rideEntity = await this.rideRepository.findOne({
      where: { rideId: rideId },
      relations: { order: true },
    });
    return this.classMapper.map(rideEntity, Ride, RideDTO);
  }
}
