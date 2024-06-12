import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RelRideDriver } from './RelRideDriver';
import { AutoMap } from '@automapper/classes';

@Entity('driver', { schema: 'drive_and_fleet' })
export class Driver {
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'driver_id' })
  driverId: number;

  @AutoMap()
  @AutoMap()
  @Column('varchar', { name: 'driver_name', nullable: true, length: 300 })
  driverName: string | null;

  @AutoMap()
  @Column('varchar', { name: 'driver_pass', nullable: true, length: 300 })
  driverPass: string | null;

  @AutoMap()
  @Column('varchar', { name: 'driver_real_name', length: 300 })
  driverRealName: string;

  @AutoMap()
  @Column('varchar', { name: 'driver_mail', nullable: true, length: 300 })
  driverMail: string | null;

  @AutoMap()
  @Column('varchar', { name: 'driver_type', nullable: true, length: 5 })
  driverType: string | null;

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

  @OneToMany(() => RelRideDriver, (relRideDriver) => relRideDriver.driver)
  relRideDrivers: RelRideDriver[];
}
