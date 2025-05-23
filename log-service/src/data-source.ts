import { DataSource } from 'typeorm';
import { AreaLog } from './log/entities/area-log.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: `postgresql://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.LOG_DATABASE_NAME}`,
  entities: [AreaLog],
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
