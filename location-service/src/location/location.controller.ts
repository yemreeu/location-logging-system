import { Controller, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto';

@Controller()
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    @Inject('AREA_SERVICE') private areaClient: ClientProxy,
    @Inject('LOG_SERVICE') private logClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @MessagePattern('create_location')
  async handleCreateLocation(createLocationDto: CreateLocationDto) {
    const location = await this.locationService.create(createLocationDto);
    this.checkLocationInAreas(location);
    return { success: true, locationId: location.id };
  }

  @MessagePattern('get_locations')
  async handleGetLocations(data: { userId?: string; limit?: number; offset?: number }) {
    const { userId, limit = 100, offset = 0 } = data;
    const cacheKey = `locations:${userId}:${limit}:${offset}`;
    const cached = await this.cacheManager.get(cacheKey);

    if (cached) {
      return cached;
    }

    const locations = await this.locationService.findAll(userId, limit, offset);
    await this.cacheManager.set(cacheKey, locations, 300); // 5 dakika cache
    return locations;
  }

  @MessagePattern('get_user_locations')
  async getUserLocations(data: { userId: string; limit?: number }) {
    return this.locationService.findAll(data.userId, data.limit);
  }

  private async checkLocationInAreas(location: any) {
    try {
      const areas = await this.areaClient.send('get_all_areas', {}).toPromise();

      for (const area of areas) {
        if (
          this.isPointInPolygon(
            { lat: location.latitude, lng: location.longitude },
            area.boundaries,
          )
        ) {
          this.logClient.emit('location_entered_area', {
            userId: location.userId,
            areaId: area.id,
            locationId: location.id,
            areaName: area.name,
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: new Date(),
          });
        }
      }
    } catch (error) {
      console.error('Error checking location in areas:', error);
    }
  }

  private isPointInPolygon(
    point: { lat: number; lng: number },
    polygon: any[],
  ): boolean {
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      if (
        polygon[i].lng > point.lng !== polygon[j].lng > point.lng &&
        point.lat <
          ((polygon[j].lat - polygon[i].lat) * (point.lng - polygon[i].lng)) /
            (polygon[j].lng - polygon[i].lng) +
            polygon[i].lat
      ) {
        return true;
      }
    }
    return false;
  }
}
