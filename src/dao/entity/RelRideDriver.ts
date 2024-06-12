import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Driver } from './Driver';
import { Ride } from './Ride';
import { AutoMap } from '@automapper/classes';

@Index('FK_rel_ride', ['rideId'], {})
@Index('FK_rel_driver', ['driverId'], {})
@Entity('rel_ride_driver', { schema: 'drive_and_fleet' })
export class RelRideDriver {
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'ridr_id' })
  ridrId: number;

  @Column('int', { name: 'ride_id', nullable: true })
  rideId: number | null;

  @Column('int', { name: 'driver_id', nullable: true })
  driverId: number | null;

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

  @AutoMap(() => Driver)
  @ManyToOne(() => Driver, (driver) => driver.relRideDrivers, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
    eager: true,
    cascade: ['insert'],
  })
  @JoinColumn([{ name: 'driver_id', referencedColumnName: 'driverId' }])
  driver: Driver;

  @ManyToOne(() => Ride, (ride) => ride.relRideDrivers, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'ride_id', referencedColumnName: 'rideId' }])
  ride: Ride;
}
