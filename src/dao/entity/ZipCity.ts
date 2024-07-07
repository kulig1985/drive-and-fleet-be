import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AutoMap } from '@automapper/classes';

@Entity('zip_city', { schema: 'drive_and_fleet' })
export class ZipCity {
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'zip_id' })
  zipId: number;

  @AutoMap()
  @Column('int', { name: 'zip', nullable: false })
  zip: number;

  @AutoMap()
  @Column('varchar', { name: 'city', nullable: false, length: 200 })
  city: string;
}
