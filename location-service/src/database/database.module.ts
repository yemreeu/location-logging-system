import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from '../location/entities/location.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: `postgresql://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.LOCATION_DATABASE_NAME}`,
      entities: [Location],
      synchronize: false, // Use migrations in production
      migrations: ['dist/migrations/*.js'],
      migrationsRun: true,
      logging: process.env.NODE_ENV === 'development',
    }),
  ],
})
export class DatabaseModule {}
