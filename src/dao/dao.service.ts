import { Injectable, Logger } from '@nestjs/common';
import { ConfigHandlerService } from '../config-handler/config-handler.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from './entity/Driver';
import { Brackets, Repository } from 'typeorm';
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
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { ZipCity } from './entity/ZipCity';
import { ZipCityDTO } from './dto/zip-city.dto';

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
    @InjectRepository(ZipCity, 'driveAndFleetMySql')
    readonly zipCityRepository: Repository<ZipCity>,
  ) {}

  async findAllWorkOrder(): Promise<WorkOrderDTO[]> {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    // const workOrderList = await this.workOrderRepository.find({
    //   where: [
    //     {
    //       crDate: Between(todayStart, todayEnd),
    //     },
    //     {
    //       boolId: 1,
    //     },
    //   ],
    //   order: {
    //     boolId: 'ASC',
    //     orderId: 'ASC',
    //   },
    // });
    const workOrderList = await this.workOrderRepository
      .createQueryBuilder('workOrder')
      .leftJoinAndSelect('workOrder.rides', 'ride')
      .leftJoinAndSelect('workOrder.partner', 'partner')
      .leftJoinAndSelect('ride.relRideDrivers', 'relRideDriver')
      .leftJoinAndSelect('relRideDriver.driver', 'driver')
      .where(
        new Brackets((qb) => {
          qb.where('workOrder.crDate BETWEEN :start AND :end', {
            start: todayStart,
            end: todayEnd,
          }).orWhere('workOrder.boolId = :boolId', { boolId: 1 });
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('relRideDriver.boolId IS NULL').orWhere(
            'relRideDriver.boolId != :relBoolId',
            { relBoolId: 0 },
          );
        }),
      )
      .orderBy('workOrder.boolId', 'ASC')
      .addOrderBy('workOrder.orderId', 'ASC')
      .getMany();

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
    return this.workOrderRepository
      .createQueryBuilder('workOrder')
      .leftJoinAndSelect('workOrder.rides', 'rides')
      .where('workOrder.orderId = :orderId', { orderId })
      .getOne();
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
    this.logger.log('makeRideFinished invoked.');
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

  async findAllRide(): Promise<RideDTO[]> {
    const currentDate = new Date();
    const sixtyDaysAgo = subDays(currentDate, 60);
    const rideEntityList = await this.rideRepository.find({
      where: {
        crDate: Between(sixtyDaysAgo, currentDate),
      },
      relations: { order: true },
    });
    return rideEntityList.map((rideEntityInstance) =>
      this.classMapper.map(rideEntityInstance, Ride, RideDTO),
    );
  }

  async findAllRideForPrint(): Promise<WorkOrderDTO[]> {
    const workOrderList = await this.workOrderRepository
      .createQueryBuilder('workOrder')
      .leftJoinAndSelect('workOrder.rides', 'ride')
      .innerJoinAndSelect('workOrder.partner', 'partner')
      .innerJoinAndSelect('ride.relRideDrivers', 'relRideDriver')
      .innerJoinAndSelect('relRideDriver.driver', 'driver')
      .innerJoinAndSelect('ride.rideSurveyResults', 'rideSurveyResult')
      .innerJoinAndSelect('rideSurveyResult.stype', 'stype')
      .innerJoinAndSelect('ride.files', 'files')
      .andWhere(
        new Brackets((qb) => {
          qb.where('relRideDriver.boolId IS NULL').orWhere(
            'relRideDriver.boolId != :relBoolId',
            { relBoolId: 0 },
          );
        }),
      )
      .andWhere('workOrder.boolId = :boolId', { boolId: 2 })
      .orderBy('workOrder.boolId', 'ASC')
      .addOrderBy('workOrder.orderId', 'ASC')
      .getMany();

    return workOrderList.map((workOrderInstance) =>
      this.classMapper.map(workOrderInstance, WorkOrder, WorkOrderDTO),
    );
  }

  async findAllZipCity(): Promise<ZipCityDTO[]> {
    const zipCityList = await this.zipCityRepository.find();
    return zipCityList.map((zipCity) =>
      this.classMapper.map(zipCity, ZipCity, ZipCityDTO),
    );
  }
}
