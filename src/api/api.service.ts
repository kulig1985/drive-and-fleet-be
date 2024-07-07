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
import { DriverModificationDto } from './dto/driver-modification.dto';
import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import { WorkOrderDTO } from '../dao/dto/workorder.dto';
import { environments } from 'eslint-plugin-prettier';

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

  async generatePdfByRideId(rideId: number): Promise<Buffer> {
    const templatePath = 'views/template/invoice_template.hbs';
    const template = fs.readFileSync(templatePath, 'utf8');
    const ride = await this.daoService.findRideById(rideId);

    const picFiles = ride.files.filter((file) => file.fileType === 'pic');
    const signFile = ride.files.find((file) => file.fileType === 'sign');

    const data = {
      orderId: ride.orderId,
      rideId: ride.rideId,
      plateNr: ride.order.plateNr,
      driverRealName: ride.relRideDrivers[0].driver.driverRealName,
      startLocationZip: ride.startLocationZip,
      startLocationCity: ride.startLocationCity,
      startLocationAddress: ride.startLocationAddress,
      finishLocationZip: ride.finishLocationZip,
      finishLocationCity: ride.finishLocationCity,
      finishLocationAddress: ride.finishLocationAddress,
      modDate: this.formatDateString(ride.modDate),
      partnerName: ride.order.partner.partnerName,
      partnerMail: ride.order.partner.partnerMail,
      partnerPhone: ride.order.partner.partnerPhone,
      rideSurveyResults: ride.rideSurveyResults,
      files: picFiles,
      signFileBase: signFile,
    };

    //Convert each image to a base64 string
    const files = data.files.map((file) => {
      const resolvedPath = path.resolve(file.filePath);
      const imageBuffer = fs.readFileSync(resolvedPath);
      return {
        fileBase: `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
        publicUrl: `${this.configHandlerService.get('publicUrl', 'url')}downloadPicture?fileId=${file.fileId}`,
      };
    });

    const signFilePath = path.resolve(data.signFileBase.filePath);
    const signBuffer = fs.readFileSync(signFilePath);
    const signBase64 = signBuffer.toString('base64');
    const signFileBase = `data:image/jpeg;base64,${signBase64}`;

    const compileTemplate = Handlebars.compile(template);
    const html = compileTemplate({ ...data, files, signFileBase });

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' }); // Ensure all resources are loaded
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    return pdfBuffer;
  }

  formatDateString(dateString: Date): string {
    if (isNaN(dateString.getTime())) {
      throw new Error('Invalid date string');
    }
    const year = dateString.getFullYear();
    const month = (dateString.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = dateString.getDate().toString().padStart(2, '0');
    const hours = dateString.getHours().toString().padStart(2, '0');
    const minutes = dateString.getMinutes().toString().padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  }
}
