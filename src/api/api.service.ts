import { Injectable, Logger } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { ConfigHandlerService } from '../config-handler/config-handler.service';
import { DaoService } from '../dao/dao.service';
import { UploadDto } from './dto/upload.dto';
import { Ride } from '../dao/entity/Ride';
import { promises as fsPromises } from 'fs';
import { WorkOrder } from '../dao/entity/WorkOrder';
import { SaveFileResultDto } from './dto/save-file-result.dto';
import { HandleUploadResultDto } from './dto/handle-upload-result.dto';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { RelRideDriver } from '../dao/entity/RelRideDriver';
import { WorkOrderDTO } from '../dao/dto/workorder.dto';
import { DriverModificationDto } from './dto/driver-modification.dto';

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name);
  constructor(
    private configHandlerService: ConfigHandlerService,
    private daoService: DaoService,
    @InjectMapper() private readonly classMapper: Mapper,
  ) {}

  async handleUpload(
    uploadDto: UploadDto,
    driverName: string,
  ): Promise<HandleUploadResultDto> {
    this.logger.log(
      'handleUpload invoked on orderId: ' +
        uploadDto.orderId +
        ' on rideId: ' +
        uploadDto.rideId,
    );

    const workOrder = await this.daoService.findWorkOrderById(
      uploadDto.orderId,
    );
    this.logger.log('workOrder found : ' + workOrder);

    const ride = workOrder.rides.find(
      (ride: Ride) => ride.rideId == uploadDto.rideId,
    );
    this.logger.log('ride found : ' + ride);
    const savedFiles: SaveFileResultDto = await this.saveFiles(
      workOrder,
      uploadDto,
      ride,
    );

    const entitySaveResult = await this.daoService.saveFilePaths(
      savedFiles,
      ride,
      driverName,
    );

    this.logger.log('entitySaveResult: ' + entitySaveResult);

    const rideSurveyResult = await this.daoService.saveSurveyResult(
      uploadDto,
      ride,
      driverName,
    );

    this.logger.log('rideSurveyResult: ' + rideSurveyResult);

    const finalisedRide = await this.daoService.makeRideFinished(
      ride,
      driverName,
    );

    this.logger.log('ride set to finished..');

    const notFinishedRide = workOrder.rides.filter(
      (rideInstance) => rideInstance.boolId == 1,
    );
    let finalisedWorkOrder: WorkOrder = undefined;
    if (notFinishedRide.length == 0) {
      this.logger.log('All ride finished! Finalize work order!');
      finalisedWorkOrder = await this.daoService.makeWorkOrderFinished(
        workOrder,
        driverName,
      );
    }

    return {
      entitySaveResult,
      rideSurveyResult,
      finalisedRide,
      finalisedWorkOrder,
    };
  }

  async saveNewWorkOrder(
    workOrderDTO: WorkOrderDTO,
    driverName: string,
  ): Promise<WorkOrder> {
    const workOrder = this.classMapper.map(
      workOrderDTO,
      WorkOrderDTO,
      WorkOrder,
    );

    this.handleCrUserOnSaveNewWorkOrder(workOrder, driverName);

    this.logger.log('driverName', driverName);
    this.logger.log('workOrder', workOrder);
    return await this.daoService.workOrderRepository.save(workOrder);
  }

  async modifyWorkOrder(workOrderDTO: WorkOrderDTO, driverName: string) {
    this.logger.log(
      'modifyWorkOrder invoked workOrderDTO',
      JSON.stringify(workOrderDTO),
      ' dirver: ',
      driverName,
    );
    const workOrder = this.classMapper.map(
      workOrderDTO,
      WorkOrderDTO,
      WorkOrder,
    );
    this.logger.log('workOrder', JSON.stringify(workOrder));
    return await this.daoService.workOrderRepository.save(workOrder);
  }

  async modifyDriverForRide(
    driverModificationDto: DriverModificationDto,
    driverName: string,
  ) {
    this.logger.log(
      'modifyDriverForRide invoked by ',
      driverName,
      'driverModificationDto: ',
      driverModificationDto,
    );

    const ride = await this.daoService.rideRepository.findOneBy({
      rideId: driverModificationDto.rideId,
    });
    this.logger.log('ride found!', ride);

    const newDriver = await this.daoService.driverRepository.findOneBy({
      driverId: driverModificationDto.driverId,
    });
    this.logger.log('newDriver found!', ride);

    for (const relRideDrives of ride.relRideDrivers) {
      relRideDrives.boolId = 0;
      relRideDrives.modDate = new Date();
      relRideDrives.modUser = driverName;
    }

    this.logger.log('relRideDrives invalidate done!');
    const newRelRide = new RelRideDriver();
    newRelRide.rideId = ride.rideId;
    newRelRide.driver = newDriver;
    newRelRide.crUser = driverName;
    ride.relRideDrivers.push(newRelRide);
    this.logger.log('newRelRide', JSON.stringify(newRelRide));
    return this.daoService.rideRepository.save(ride);
  }

  private handleCrUserOnSaveNewWorkOrder(
    workOrder: WorkOrder,
    driverName: string,
  ) {
    workOrder.crUser = driverName;
    workOrder.rides.map((ride: Ride) => {
      ride.crUser = driverName;

      ride.relRideDrivers.map((relRide: RelRideDriver) => {
        relRide.crUser = driverName;
      });
    });
  }

  private async saveFiles(
    workOrder: WorkOrder,
    uploadDto: UploadDto,
    ride: Ride,
  ) {
    try {
      const savedFiles = [];
      const fileDir = this.configHandlerService.get('fileDir', 'fileDir');
      const orderDirectory = join(fileDir, String(workOrder.orderId));

      await fsPromises.mkdir(orderDirectory, { recursive: true });
      this.logger.log('Order directory created: ' + orderDirectory);

      let fileCounter = 0;
      for (const file of uploadDto.uploadedFiles) {
        const buffer = Buffer.from(file.content.split(',')[1], 'base64');
        const filePath = join(
          orderDirectory,
          String(ride.rideId) +
            '_' +
            String(fileCounter) +
            this.getFileExtension(file.name),
        );
        await writeFile(filePath, buffer);
        savedFiles.push(filePath);
        fileCounter++;
      }

      const signatureBuffer = Buffer.from(
        uploadDto.signature.split(',')[1],
        'base64',
      );
      const signaturePath = join(
        orderDirectory,
        String(ride.rideId) + '_' + String(fileCounter) + '_signature.png',
      );
      await writeFile(signaturePath, signatureBuffer);
      return { savedFiles, signaturePath };
    } catch (err) {
      this.logger.error('saveFiles Error: ' + err.message);
      throw new Error('Cannot save files and signature!');
    }
  }

  private getFileExtension(fileName: string): string | undefined {
    const lastDotIndex = fileName.lastIndexOf('.');
    if (lastDotIndex !== -1 && lastDotIndex !== fileName.length - 1) {
      return fileName.slice(lastDotIndex);
    }
    return undefined;
  }

  async downloadPicture(fileId: number): Promise<string> {
    const file = await this.daoService.fileRepository.findOne({
      where: { fileId: fileId },
    });
    this.logger.log('file found: ', file);
    const filePath = file.filePath;
    this.logger.log('filePath: ', filePath);

    return filePath;
  }
}
