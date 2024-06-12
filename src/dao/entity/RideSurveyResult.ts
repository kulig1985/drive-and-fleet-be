import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ride } from './Ride';
import { SurveyDResultType } from './SurveyDResultType';
import { AutoMap } from '@automapper/classes';

@Index('FK_surv_to_ride', ['rideId'], {})
@Index('FK_surv_to_type', ['stypeId'], {})
@Entity('ride_survey_result', { schema: 'drive_and_fleet' })
export class RideSurveyResult {
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'sure_id' })
  sureId: number;

  @Column('int', { name: 'ride_id' })
  rideId: number;

  @AutoMap()
  @Column('int', { name: 'stype_id' })
  stypeId: number;

  @AutoMap()
  @Column('varchar', { name: 'surv_value', nullable: true, length: 4000 })
  survValue: string | null;

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

  @ManyToOne(() => Ride, (ride) => ride.rideSurveyResults, {
    onDelete: 'RESTRICT',
    onUpdate: 'RESTRICT',
  })
  @JoinColumn([{ name: 'ride_id', referencedColumnName: 'rideId' }])
  ride: Ride;

  @AutoMap(() => SurveyDResultType)
  @ManyToOne(
    () => SurveyDResultType,
    (surveyDResultType) => surveyDResultType.rideSurveyResults,
    { onDelete: 'RESTRICT', onUpdate: 'RESTRICT', eager: true },
  )
  @JoinColumn([{ name: 'stype_id', referencedColumnName: 'stypeId' }])
  stype: SurveyDResultType;
}
