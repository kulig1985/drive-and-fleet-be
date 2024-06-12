import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { WorkOrder } from './WorkOrder';
import { AutoMap } from '@automapper/classes';

@Entity('partner', { schema: 'drive_and_fleet' })
export class Partner {
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'partner_id' })
  partnerId: number;
  @AutoMap()
  @Column('varchar', { name: 'partner_name', length: 300 })
  partnerName: string;
  @AutoMap()
  @Column('varchar', { name: 'partner_type', nullable: true, length: 5 })
  partnerType: string | null;
  @AutoMap()
  @Column('varchar', { name: 'partner_mail', nullable: true, length: 100 })
  partnerMail: string | null;
  @AutoMap()
  @Column('varchar', { name: 'partner_phone', nullable: true, length: 20 })
  partnerPhone: string | null;

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

  @OneToMany(() => WorkOrder, (workOrder) => workOrder.partner)
  workOrders: WorkOrder[];
}
