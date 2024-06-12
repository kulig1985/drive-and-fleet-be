import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Ride } from './Ride';
import { AutoMap } from '@automapper/classes';

@Entity('file', { schema: 'drive_and_fleet' })
export class File {
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'file_id' })
  fileId: number;

  @Column('int', { name: 'ride_id' })
  rideId: number;

  @AutoMap()
  @Column('varchar', { name: 'file_name', nullable: true, length: 200 })
  fileName: string | null;

  @AutoMap()
  @Column('varchar', { name: 'file_path', nullable: true, length: 200 })
  filePath: string | null;

  @AutoMap()
  @Column('varchar', { name: 'file_type', nullable: true, length: 10 })
  fileType: string | null;

  @Column('datetime', { name: 'cr_date', nullable: true })
  crDate: Date | null;

  @Column('varchar', { name: 'cr_user', nullable: true, length: 200 })
  crUser: string | null;

  @Column('datetime', { name: 'mod_date', nullable: true })
  modDate: Date | null;

  @Column('varchar', { name: 'mod_user', nullable: true, length: 200 })
  modUser: string | null;

  @Column('int', { name: 'bool_id', nullable: true })
  boolId: number | null;

  @AutoMap()
  @ManyToOne(() => Ride, (ride) => ride.rideSurveyResults, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'ride_id', referencedColumnName: 'rideId' }])
  ride: Ride;
}
