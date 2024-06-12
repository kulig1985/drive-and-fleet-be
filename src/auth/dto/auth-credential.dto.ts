import { AutoMap } from '@automapper/classes';

export class AuthCredentialDto {
  @AutoMap()
  driverName: string;
  @AutoMap()
  driverPass: string;
  @AutoMap()
  driverRealName: string;
  @AutoMap()
  driverMail: string;
  @AutoMap()
  driverType: string;
  @AutoMap()
  crUser: string;
}
