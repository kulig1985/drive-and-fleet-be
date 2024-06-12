import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigHandlerService } from '../config-handler/config-handler.service';
import { JwtService } from '@nestjs/jwt';
import { Strategy, ExtractJwt } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configHandlerService: ConfigHandlerService,
    private jwtService: JwtService,
  ) {
    super({
      secretOrKey: configHandlerService.get('jwt', 'jwtSecret'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(jwt: any): Promise<any> {
    return {
      driverType: jwt.driverType,
      driverName: jwt.driverName,
      iat: jwt.iat,
      exp: jwt.exp,
    };
  }
}
