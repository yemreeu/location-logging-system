import { Test, TestingModule } from '@nestjs/testing';
import { LogService } from '../src/log/log.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AreaLog } from '../src/log/entities';
import { Repository } from 'typeorm';

describe('LogService', () => {
  let service: LogService;
  let repository: jest.Mocked<Repository<AreaLog>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LogService,
        {
          provide: getRepositoryToken(AreaLog),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LogService>(LogService);
    repository = module.get(getRepositoryToken(AreaLog));
  });

  describe('getStats', () => {
    it('should return stats', async () => {
      const mockQueryBuilder: any = {
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(10),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        addGroupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn()
          .mockResolvedValueOnce([
            { areaId: 'area1', areaName: 'Area 1', count: 5 },
            { areaId: 'area2', areaName: 'Area 2', count: 3 },
          ])
          .mockResolvedValueOnce([
            { userId: 'user1', count: 8 },
            { userId: 'user2', count: 2 },
          ]),
      };

      repository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getStats('user1', '2023-01-01', '2023-12-31');

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('log');
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
      expect(mockQueryBuilder.getCount).toHaveBeenCalled();
      expect(mockQueryBuilder.getRawMany).toHaveBeenCalledTimes(2);
      expect(result).toEqual({
        totalLogs: 10,
        areaStats: [
          { areaId: 'area1', areaName: 'Area 1', count: 5 },
          { areaId: 'area2', areaName: 'Area 2', count: 3 },
        ],
        userStats: [
          { userId: 'user1', count: 8 },
          { userId: 'user2', count: 2 },
        ],
      });
    });
  });
});
