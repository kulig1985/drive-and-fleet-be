import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UploadDto } from './dto/upload.dto';
import { ApiService } from './api.service';
import { HandleUploadResultDto } from './dto/handle-upload-result.dto';
import { WorkOrderDTO } from '../dao/dto/workorder.dto';
import { WorkOrder } from '../dao/entity/WorkOrder';
import { existsSync } from 'fs';
import { Response } from 'express';
import { DriverModificationDto } from './dto/driver-modification.dto';

@Controller('api')
@UseGuards(AuthGuard())
@ApiBearerAuth()
export class ApiController {
  private readonly logger = new Logger(ApiController.name);
  constructor(private apiService: ApiService) {}

  @Post('handleUpload')
  async handleUpload(
    @Body() uploadDto: UploadDto,
    @Request() req: any,
  ): Promise<HandleUploadResultDto> {
    const driverName = req.user.driverName;
    this.logger.log('handleUpload invoked by driverName: ' + driverName);
    return await this.apiService.handleUpload(uploadDto, driverName);
  }

  @Post('saveNewWorkOrder')
  async saveNewWorkOrder(
    @Body() workOrderDTO: WorkOrderDTO,
    @Request() req: any,
  ): Promise<WorkOrder> {
    const driverName = req.user.driverName;
    this.logger.log('saveNewWorkOrder invoked by driverName: ' + driverName);
    return await this.apiService.saveNewWorkOrder(workOrderDTO, driverName);
  }

  @Patch('modifyWorkOrder')
  async modifyWorkOrder(
    @Body() workOrderDTO: WorkOrderDTO,
    @Request() req: any,
  ) {
    const driverName = req.user.driverName;
    this.logger.log('modifyWorkOrder invoked by driverName: ' + driverName);
    return await this.apiService.modifyWorkOrder(workOrderDTO, driverName);
  }

  @Patch('modifyDriverForRide')
  async modifyDriverForRide(
    @Body() driverModificationDto: DriverModificationDto,
    @Request() req: any,
  ) {
    const driverName = req.user.driverName;
    this.logger.log('modifyDriverForRide invoked by driverName: ' + driverName);
    return await this.apiService.modifyDriverForRide(
      driverModificationDto,
      driverName,
    );
  }

  @Get('downloadPicture')
  async downloadPicture(@Query('fileId') fileId: number, @Res() res: Response) {
    const filePath = await this.apiService.downloadPicture(fileId);

    if (existsSync(filePath)) {
      const fileName = filePath.split('/').pop();

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );
      res.setHeader('Content-Type', 'application/octet-stream');

      res.sendFile(filePath, (err) => {
        if (err) {
          res
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .send('Failed to download file');
        }
      });
    } else {
      res.status(HttpStatus.NOT_FOUND).send('File not found');
    }
  }

  @Get('generatePdfByRideId')
  async generatePdfByRideId(
    @Query('rideId') rideId: number,
    @Res() res: Response,
  ) {
    // const data = {
    //   title: 'My PDF',
    //   content: 'This is the content of my PDF',
    //   imagePaths: [
    //     '/Users/kuligabor/SELF_PROJECTS/Drive-and-fleet/upload/55/57_0.jpg',
    //     '/Users/kuligabor/SELF_PROJECTS/Drive-and-fleet/upload/55/57_0.jpg',
    //     '/Users/kuligabor/SELF_PROJECTS/Drive-and-fleet/upload/55/57_0.jpg',
    //   ],
    // };
    const pdfBuffer = await this.apiService.generatePdfByRideId(rideId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=my-pdf.pdf',
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }
}
