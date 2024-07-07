import { AutoMap } from '@automapper/classes';

export class ZipCityDTO {
  @AutoMap()
  zipId?: number;
  @AutoMap()
  zip?: number;
  @AutoMap()
  city?: string;
}
