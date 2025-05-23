import { Controller, Get, Post, Put, Delete, Body, Param, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CreateAreaDto } from './dto';

@ApiTags('areas')
@Controller('areas')
@UseGuards(ThrottlerGuard)
export class AreaController {
  constructor(
    @Inject('AREA_SERVICE') private areaClient: ClientProxy,
  ) {}

  @ApiBody({
    schema: {
      example: {
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
  })
  @Post()
  @ApiOperation({ summary: 'Create a new area' })
  @ApiResponse({ status: 201, description: 'Area created successfully' })
  async create(@Body() createAreaDto: CreateAreaDto) {
    return this.areaClient.send('create_area', createAreaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all areas' })
  @ApiResponse({ status: 200, description: 'Areas retrieved successfully' })
  async findAll() {
    return this.areaClient.send('get_all_areas', {});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get area by ID' })
  @ApiResponse({ status: 200, description: 'Area retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Area not found' })
  async findOne(@Param('id') id: string) {
    return this.areaClient.send('get_area', { id });
  }

  @ApiBody({
    schema: {
      example: {
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
  })
  @Put(':id')
  @ApiOperation({ summary: 'Update area' })
  @ApiResponse({ status: 200, description: 'Area updated successfully' })
  async update(@Param('id') id: string, @Body() updateAreaDto: CreateAreaDto) {
    return this.areaClient.send('update_area', { id, ...updateAreaDto });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete area' })
  @ApiResponse({ status: 200, description: 'Area deleted successfully' })
  async remove(@Param('id') id: string) {
    return this.areaClient.send('delete_area', { id });
  }
}
