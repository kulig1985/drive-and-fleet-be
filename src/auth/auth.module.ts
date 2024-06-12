import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DaoModule } from '../dao/dao.module';
import { MapperProfile } from '../mapper.profile';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigHandlerModule } from '../config-handler/config-handler.module';
import { ConfigHandlerService } from '../config-handler/config-handler.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    DaoModule,
    ConfigHandlerModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigHandlerModule],
      inject: [ConfigHandlerService],
      useFactory: async (configHandlerService: ConfigHandlerService) => ({
        secret: configHandlerService.get('jwt', 'jwtSecret'),
        signOptions: {
          expiresIn: 86400,
        },
      }),
    }),
  ],
  providers: [AuthService, MapperProfile, JwtStrategy],
  controllers: [AuthController],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
