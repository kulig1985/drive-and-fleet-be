import { Body, Controller, Get, Header, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthCredentialDto } from './dto/auth-credential.dto';
import { Driver } from '../dao/entity/Driver';
import { JwtResponseDto } from './dto/jwt-response.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('createUser')
  async createUser(
    @Body() authCredentialDto: AuthCredentialDto,
  ): Promise<Driver> {
    return await this.authService.createUser(authCredentialDto);
  }
  @Post('signIn')
  async signIn(
    @Body() authCredentialDto: AuthCredentialDto,
  ): Promise<JwtResponseDto> {
    return await this.authService.signIn(authCredentialDto);
  }

  @Get('validateJwt')
  @UseGuards(AuthGuard())
  @ApiBearerAuth()
  @Header('content-type', 'application/json')
  async validateJwt() {
    return { message: 'valid', statusCode: 200 };
  }
}
