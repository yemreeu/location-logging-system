import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { MessagePattern } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { Area } from './entities/area.entity';
import { ApiBody } from '@nestjs/swagger';

@Controller('areas')
export class AreaController {
  constructor(
    private readonly areaService: AreaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @ApiBody({
    schema: {
      example: {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        location: {
          name: 'Anıtkabir',
          description: 'Ankara Anıtkabir bölgesi sınırları',
          boundaries: [
            { lat: 39.9255, lng: 32.8339 },
            { lat: 39.9265, lng: 32.837 },
            { lat: 39.9247, lng: 32.8395 },
            { lat: 39.9228, lng: 32.8372 },
            { lat: 39.9227, lng: 32.834 },
            { lat: 39.924, lng: 32.832 },
            { lat: 39.9255, lng: 32.8339 },
          ],
          isActive: true,
        },
      },
    },
  })
  @Post()
  async create(@Body() createAreaDto: CreateAreaDto) {
    const area = await this.areaService.create(createAreaDto);

    // Clear cache when new area is created
    await this.cacheManager.del('all_areas');

    return area;
  }

  @Get()
  async findAll() {
    const cacheKey = 'all_areas';
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const areas = await this.areaService.findAll();
    await this.cacheManager.set(cacheKey, areas, 3600); // 1 hour

    return areas;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const cacheKey = `area:${id}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const area = await this.areaService.findOne(id);
    await this.cacheManager.set(cacheKey, area, 3600);

    return area;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateAreaDto: CreateAreaDto) {
    const area = await this.areaService.update(id, updateAreaDto);

    // Clear related cache
    await this.cacheManager.del('all_areas');
    await this.cacheManager.del(`area:${id}`);

    return area;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.areaService.remove(id);

    // Clear related cache
    await this.cacheManager.del('all_areas');
    await this.cacheManager.del(`area:${id}`);

    return { success: true };
  }

  @MessagePattern('get_all_areas')
  async getAllAreas() {
    return this.areaService.findAllActive();
  }

  @MessagePattern('check_point_in_areas')
  async checkPointInAreas(data: { lat: number; lng: number }) {
    const areas = await this.areaService.findAllActive();
    const matchingAreas: Area[] = [];

    for (const area of areas) {
      if (
        this.isPointInPolygon({ lat: data.lat, lng: data.lng }, area.boundaries)
      ) {
        matchingAreas.push(area);
      }
    }

    return matchingAreas;
  }

  private isPointInPolygon(
    point: { lat: number; lng: number },
    polygon: any[],
  ): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (
        polygon[i].lng > point.lng !== polygon[j].lng > point.lng &&
        point.lat <
          ((polygon[j].lat - polygon[i].lat) * (point.lng - polygon[i].lng)) /
            (polygon[j].lng - polygon[i].lng) +
            polygon[i].lat
      ) {
        inside = !inside;
      }
    }
    return inside;
  }
}
