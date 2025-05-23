import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('area_logs')
@Index(['userId', 'createdAt'])
@Index(['areaId', 'createdAt'])
export class AreaLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 50 })
  @Index()
  userId: string;

  @Column('uuid')
  @Index()
  areaId: string;

  @Column('uuid')
  locationId: string;

  @Column('varchar', { length: 100, nullable: true })
  areaName: string;

  @Column('decimal', { precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column('decimal', { precision: 11, scale: 8, nullable: true })
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;
}