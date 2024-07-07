import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { DaoService } from './dao.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import {
  DriverDTO,
  PartnerDTO,
  RideDTO,
  WorkOrderDTO,
} from './dto/workorder.dto';
import { ZipCity } from './entity/ZipCity';
import { ZipCityDTO } from './dto/zip-city.dto';

@Controller('api/dao')
@UseGuards(AuthGuard())
@ApiBearerAuth()
export class DaoController {
  constructor(private daoService: DaoService) {}

  @Get('findAllWorkOrder')
  async findAllWorkOrder(): Promise<WorkOrderDTO[]> {
    return await this.daoService.findAllWorkOrder();
  }

  @Get('findAllValidPartner')
  async findAllValidPartner(): Promise<PartnerDTO[]> {
    return await this.daoService.findAllValidPartner();
  }

  @Get('findAllDriver')
  async findAllDriver(): Promise<DriverDTO[]> {
    return await this.daoService.findAllDriver();
  }

  @Get('findRideById')
  async findRideById(@Query('rideId') rideId: number): Promise<RideDTO> {
    return await this.daoService.findRideById(rideId);
  }

  @Get('findAllRide')
  async findAllRide(): Promise<RideDTO[]> {
    return await this.daoService.findAllRide();
  }

  @Get('findAllRideForPrint')
  async findAllRideForPrint(): Promise<WorkOrderDTO[]> {
    return await this.daoService.findAllRideForPrint();
  }

  @Get('findAllZipCity')
  async findAllZipCity(): Promise<ZipCityDTO[]> {
    return await this.daoService.findAllZipCity();
  }
}
