import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 100 })
  @Index()
  name: string;

  @Column('text')
  description: string;

  @Column('jsonb')
  boundaries: Array<{ lat: number; lng: number }>;

  @Column('boolean', { default: true })
  @Index()
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}