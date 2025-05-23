import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateAreaTable1690000000000 implements MigrationInterface {
  name = 'CreateAreaTable1690000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'areas',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'boundaries',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            isNullable: false,
            default: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    // Create indexes
    await queryRunner.createIndex(
      'areas',
      new TableIndex({
        name: 'IDX_areas_name',
        columnNames: ['name'],
      }),
    );

    await queryRunner.createIndex(
      'areas',
      new TableIndex({
        name: 'IDX_areas_isActive',
        columnNames: ['isActive'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('areas', 'IDX_areas_name');
    await queryRunner.dropIndex('areas', 'IDX_areas_isActive');
    await queryRunner.dropTable('areas');
  }
}
