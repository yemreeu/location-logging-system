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
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Cache } from 'cache-manager';
import { AreaService } from './area.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { Area } from './entities/area.entity';

@Controller('areas')
export class AreaController {
  constructor(
    private readonly areaService: AreaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  // Microservice message handlers

  @MessagePattern('create_area')
  async handleCreate(@Payload() createAreaDto: CreateAreaDto) {
    const area = await this.areaService.create(createAreaDto);
    await this.cacheManager.del('all_areas');
    return area;
  }

  @MessagePattern('get_all_areas')
  async getAllAreas() {
    return this.areaService.findAllActive();
  }

  @MessagePattern('get_area')
  async handleGetArea(@Payload() data: { id: string }) {
    const cacheKey = `area:${data.id}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const area = await this.areaService.findOne(data.id);
    await this.cacheManager.set(cacheKey, area, 3600);
    return area;
  }

  @MessagePattern('update_area')
  async handleUpdateArea(@Payload() data: { id: string } & CreateAreaDto) {
    const { id, ...updateData } = data;
    const area = await this.areaService.update(id, updateData);
    await this.cacheManager.del('all_areas');
    await this.cacheManager.del(`area:${id}`);
    return area;
  }

  @MessagePattern('delete_area')
  async handleDeleteArea(@Payload() data: { id: string }) {
    await this.areaService.remove(data.id);
    await this.cacheManager.del('all_areas');
    await this.cacheManager.del(`area:${data.id}`);
    return { success: true };
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
