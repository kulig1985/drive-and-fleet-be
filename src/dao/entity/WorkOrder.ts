import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Partner } from './Partner';
import { Ride } from './Ride';
import { AutoMap } from '@automapper/classes';

@Index('FK_order_partner', ['partnerId'], {})
@Entity('work_order', { schema: 'drive_and_fleet' })
export class WorkOrder {
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'order_id' })
  orderId: number;

  @AutoMap()
  @Column('varchar', { name: 'plate_nr', nullable: true, length: 200 })
  plateNr: string | null;

  @AutoMap()
  @Column('varchar', { name: 'car_type', nullable: true, length: 100 })
  carType: string | null;

  @AutoMap()
  @Column('varchar', { name: 'car_user_name', nullable: true, length: 200 })
  carUserName: string | null;

  @AutoMap()
  @Column('int', { name: 'ride_cnt', nullable: true })
  rideCnt: number | null;

  @AutoMap()
  @Column('int', { name: 'partner_id', nullable: true })
  partnerId: number;

  @AutoMap()
  @Column('varchar', { name: 'comment_text', nullable: true, length: 4000 })
  commentText: string | null;

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

  @AutoMap(() => Partner)
  @ManyToOne(() => Partner, (partner) => partner.workOrders, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
    eager: true,
    nullable: true,
  })
  @JoinColumn([{ name: 'partner_id', referencedColumnName: 'partnerId' }])
  partner: Partner;

  @AutoMap(() => Ride)
  @OneToMany(() => Ride, (ride) => ride.order, {
    eager: true,
    cascade: ['insert'],
    nullable: true,
  })
  rides: Ride[];
}
