import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';

describe('Location Microservice (e2e)', () => {
  let app: INestApplication;
  let client: ClientProxy;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        AppModule,
        ClientsModule.register([
          {
            name: 'LOCATION_CLIENT',
            transport: Transport.RMQ,
            options: {
              urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
              queue: 'location_queue',
              queueOptions: { durable: false },
            },
          },
        ]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    client = moduleFixture.get<ClientProxy>('LOCATION_CLIENT');
    await client.connect();
  });

  afterAll(async () => {
    await client.close();
    await app.close();
  });

  it('should create a location via "create_location"', async () => {
    const payload = {
      latitude: 41.015137,
      longitude: 28.97953,
      userId: 'test-user-id',
    };

    const response = await client.send('create_location', payload).toPromise();

    expect(response).toHaveProperty('success', true);
    expect(response).toHaveProperty('locationId');
  });

  it('should return locations via "get_user_locations"', async () => {
    const response = await client
      .send('get_user_locations', { userId: 'test-user-id' })
      .toPromise();

    expect(Array.isArray(response)).toBe(true);
    expect(response.length).toBeGreaterThan(0);
    expect(response[0]).toHaveProperty('userId', 'test-user-id');
    expect(response[0]).toHaveProperty('latitude');
    expect(response[0]).toHaveProperty('longitude');
  });
});
