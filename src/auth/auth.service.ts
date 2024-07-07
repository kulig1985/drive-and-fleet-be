import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { DaoService } from '../dao/dao.service';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import { Driver } from '../dao/entity/Driver';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtResponseDto } from './dto/jwt-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private daoService: DaoService,
    @InjectMapper() private readonly classMapper: Mapper,
    private jwtService: JwtService,
  ) {}

  async createUser(authCredentialDto: AuthCredentialDto): Promise<Driver> {
    const salt = await bcrypt.genSalt();

    authCredentialDto.driverPass = await bcrypt.hash(
      authCredentialDto.driverPass,
      salt,
    );

    const newDriver = this.classMapper.map(
      authCredentialDto,
      AuthCredentialDto,
      Driver,
    );
    newDriver.driverType = 'BASE';
    this.logger.log('newDriver', newDriver.driverRealName);
    return this.daoService.driverRepository.save(newDriver);
  }

  async signIn(authCredentialDto: AuthCredentialDto): Promise<JwtResponseDto> {
    const { driverName, driverPass } = authCredentialDto;
    const driver = await this.daoService.driverRepository.findOne({
      where: { driverName: driverName },
    });
    if (driver && (await bcrypt.compare(driverPass, driver.driverPass))) {
      const driverType = driver.driverType;
      const payload = { driverName, driverType };
      return { jwt: this.jwtService.sign(payload) };
    } else {
      throw new UnauthorizedException('Please check your login credentials!');
    }
  }
}
