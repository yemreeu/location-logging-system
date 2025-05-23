import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';

describe('Area Microservice (e2e)', () => {
  let app: INestApplication;
  let client: ClientProxy;
  let createdAreaId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ClientsModule.register([
          {
            name: 'AREA_CLIENT',
            transport: Transport.RMQ,
            options: {
              urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
              queue: 'area_queue',
              queueOptions: { durable: false },
            },
          },
        ]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    client = moduleFixture.get<ClientProxy>('AREA_CLIENT');
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
    await app.close();
  });

  it('should create an area via "create_area"', async () => {
    const createAreaDto = {
      name: 'Test Area',
      description: 'This is a test area',
      boundaries: [
        { lat: 41.0, lng: 28.9 },
        { lat: 41.0, lng: 29.0 },
        { lat: 41.1, lng: 29.0 },
        { lat: 41.1, lng: 28.9 },
      ],
      isActive: true,
    };

    const response = await client
      .send('create_area', createAreaDto)
      .toPromise();

    expect(response).toHaveProperty('id');
    expect(response).toHaveProperty('name', createAreaDto.name);
    createdAreaId = response.id;
  });

  it('should get all active areas via "get_all_areas"', async () => {
    const areas = await client.send('get_all_areas', {}).toPromise();

    expect(Array.isArray(areas)).toBe(true);
    expect(areas.length).toBeGreaterThan(0);
    expect(areas[0]).toHaveProperty('isActive', true);
  });

  it('should get a single area via "get_area"', async () => {
    const area = await client
      .send('get_area', { id: createdAreaId })
      .toPromise();

    expect(area).toHaveProperty('id', createdAreaId);
    expect(area).toHaveProperty('name', 'Test Area');
  });

  it('should update an area via "update_area"', async () => {
    const updateData = {
      id: createdAreaId,
      name: 'Updated Area Name',
      boundaries: [
        { lat: 41.0, lng: 28.9 },
        { lat: 41.0, lng: 29.1 },
        { lat: 41.2, lng: 29.1 },
        { lat: 41.2, lng: 28.9 },
      ],
      isActive: false,
    };

    const updatedArea = await client
      .send('update_area', updateData)
      .toPromise();

    expect(updatedArea).toHaveProperty('id', createdAreaId);
    expect(updatedArea).toHaveProperty('name', updateData.name);
    expect(updatedArea).toHaveProperty('isActive', false);
  });

  it('should check point in areas via "check_point_in_areas"', async () => {
    const point = { lat: 41.05, lng: 29.0 };
    const matchedAreas = await client
      .send('check_point_in_areas', point)
      .toPromise();

    expect(Array.isArray(matchedAreas)).toBe(true);
    if (matchedAreas.length > 0) {
      expect(matchedAreas[0]).toHaveProperty('boundaries');
    }
  });
});
