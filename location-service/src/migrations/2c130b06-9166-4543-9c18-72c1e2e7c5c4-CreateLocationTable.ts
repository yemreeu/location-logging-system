import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateLocationTable16400000000016 implements MigrationInterface {
  name = 'CreateLocationTable16400000000016';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('locations');
    if (tableExists) return;
    await queryRunner.createTable(
      new Table({
        name: 'locations',
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
            isNullable: false,
          },
          {
            name: 'latitude',
            type: 'decimal',
            precision: 10,
            scale: 8,
            isNullable: false,
          },
          {
            name: 'longitude',
            type: 'decimal',
            precision: 11,
            scale: 8,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    //Create indexes for better performance
    await queryRunner.createIndex(
      'locations',
      new TableIndex({
        name: 'IDX_locations_userId',
        columnNames: ['userId'],
      }),
    );

    await queryRunner.createIndex(
      'locations',
      new TableIndex({
        name: 'IDX_locations_userId_createdAt',
        columnNames: ['userId', 'createdAt'],
      }),
    );

    await queryRunner.createIndex(
      'locations',
      new TableIndex({
        name: 'IDX_locations_createdAt',
        columnNames: ['createdAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('locations');
  }
}
