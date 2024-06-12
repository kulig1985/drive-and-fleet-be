import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { RideSurveyResult } from './RideSurveyResult';
import { AutoMap } from '@automapper/classes';

@Entity('survey_d_result_type', { schema: 'drive_and_fleet' })
export class SurveyDResultType {
  @AutoMap()
  @PrimaryGeneratedColumn({ type: 'int', name: 'stype_id' })
  stypeId: number;

  @AutoMap()
  @Column('varchar', { name: 'type_name', length: 100 })
  typeName: string;

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

  @OneToMany(
    () => RideSurveyResult,
    (rideSurveyResult) => rideSurveyResult.stype,
  )
  rideSurveyResults: RideSurveyResult[];
}
