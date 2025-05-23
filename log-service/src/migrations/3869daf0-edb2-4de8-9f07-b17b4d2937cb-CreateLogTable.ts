import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAreaLogsTable1690000000000 implements MigrationInterface {
  name = 'CreateAreaLogsTable1690000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'area_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'areaId',
            type: 'uuid',
          },
          {
            name: 'locationId',
            type: 'uuid',
          },
          {
            name: 'areaName',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 11,
            scale: 8,
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    // Indexes
    await queryRunner.createIndex(
      'area_logs',
      new TableIndex({
        name: 'IDX_area_logs_userId',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'area_logs',
      new TableIndex({
        name: 'IDX_area_logs_areaId',
        columnNames: ['areaId'],
      }),
    );

    await queryRunner.createIndex(
      'area_logs',
      new TableIndex({
        name: 'IDX_area_logs_userId_createdAt',
        columnNames: ['userId', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'area_logs',
      new TableIndex({
        name: 'IDX_area_logs_areaId_createdAt',
        columnNames: ['areaId', 'createdAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('area_logs');
  }
}
