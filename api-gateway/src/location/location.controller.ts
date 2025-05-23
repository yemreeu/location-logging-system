import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateLocationDto } from './dto';

@ApiTags('locations')
@Controller('locations')
@UseGuards(ThrottlerGuard)
export class LocationController {
  constructor(
    @Inject('LOCATION_SERVICE') private locationClient: ClientProxy,
  ) {}

  @ApiBody({
    schema: {
      example: {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        latitude: 41.1612,
        longitude: 29.0292,
      },
    },
  })
  @Post()
  @ApiOperation({ summary: 'Create a new location entry' })
  @ApiResponse({ status: 201, description: 'Location created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationClient.send('create_location', createLocationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get locations' })
  @ApiResponse({ status: 200, description: 'Locations retrieved successfully' })
  async findAll(
    @Query('userId') userId?: string,
    @Query('limit') limit = 100,
    @Query('offset') offset = 0,
  ) {
    return this.locationClient.send('get_locations', {
      userId,
      limit,
      offset,
    });
  }
}
