import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RelRideDriver } from './RelRideDriver';
import { WorkOrder } from './WorkOrder';
import { RideSurveyResult } from './RideSurveyResult';
import { AutoMap } from '@automapper/classes';
import { File } from './File';

@Index('FK_ride_order', ['orderId'], {})
@Entity('ride', { schema: 'drive_and_fleet' })
export class Ride {
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'ride_id' })
  rideId: number;

  @AutoMap()
  @Column('varchar', { name: 'car_type', nullable: true, length: 100 })
  carType: string | null;

  @AutoMap()
  @Column('varchar', { name: 'car_user_name', nullable: true, length: 200 })
  carUserName: string | null;

  @AutoMap()
  @Column('int', { name: 'order_id' })
  orderId: number;

  @AutoMap()
  @Column('int', { name: 'execute_nr', nullable: true })
  executeNr: number | null;

  @AutoMap()
  @Column('int', { name: 'start_location_zip', nullable: true })
  startLocationZip: number | null;

  @AutoMap()
  @Column('varchar', {
    name: 'start_location_city',
    nullable: true,
    length: 50,
  })
  startLocationCity: string | null;

  @AutoMap()
  @Column('varchar', {
    name: 'start_location_address',
    nullable: true,
    length: 100,
  })
  startLocationAddress: string | null;

  @AutoMap()
  @Column('int', { name: 'finish_location_zip', nullable: true })
  finishLocationZip: number | null;

  @AutoMap()
  @Column('varchar', {
    name: 'finish_location_city',
    nullable: true,
    length: 50,
  })
  finishLocationCity: string | null;

  @AutoMap()
  @Column('varchar', {
    name: 'finish_location_address',
    nullable: true,
    length: 100,
  })
  finishLocationAddress: string | null;

  @AutoMap()
  @Column('datetime', { name: 'cr_date', nullable: true })
  crDate: Date | null;

  @AutoMap()
  @Column('varchar', { name: 'cr_user', nullable: true, length: 200 })
  crUser: string | null;

  @AutoMap()
  @Column('datetime', { name: 'mod_date', nullable: true })
  modDate: Date | null;

  @AutoMap()
  @Column('varchar', { name: 'mod_user', nullable: true, length: 200 })
  modUser: string | null;

  @AutoMap()
  @Column('int', { name: 'bool_id', nullable: true })
  boolId: number | null;

  @AutoMap(() => RelRideDriver)
  @OneToMany(() => RelRideDriver, (relRideDriver) => relRideDriver.ride, {
    eager: true,
    cascade: ['insert'],
  })
  relRideDrivers: RelRideDriver[];

  @AutoMap(() => WorkOrder)
  @ManyToOne(() => WorkOrder, (workOrder) => workOrder.rides, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'order_id', referencedColumnName: 'orderId' }])
  order: WorkOrder;

  @AutoMap(() => RideSurveyResult)
  @OneToMany(
    () => RideSurveyResult,
    (rideSurveyResult) => rideSurveyResult.ride,
    { eager: true },
  )
  rideSurveyResults: RideSurveyResult[];

  @AutoMap(() => File)
  @OneToMany(() => File, (file) => file.ride, { eager: true })
  files: File[];
}
