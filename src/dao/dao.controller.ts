import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { DaoService } from './dao.service';
import { WorkOrder } from './entity/WorkOrder';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { Partner } from './entity/Partner';
import { Driver } from './entity/Driver';
import { DriverDTO, PartnerDTO, RideDTO, WorkOrderDTO } from './dto/workorder.dto';
import { Ride } from './entity/Ride';

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
}
