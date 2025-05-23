import { Controller, Get, Query, Inject, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('logs')
@Controller('logs')
@UseGuards(ThrottlerGuard)
export class LogController {
  constructor(
    @Inject('LOG_SERVICE') private logClient: ClientProxy,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get area entry logs' })
  @ApiResponse({ status: 200, description: 'Logs retrieved successfully' })
  async findAll(
    @Query('userId') userId?: string,
    @Query('areaId') areaId?: string,
    @Query('limit') limit = 100,
    @Query('offset') offset = 0,
  ) {
    return this.logClient.send('get_logs', {
      userId,
      areaId,
      limit,
      offset,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get logging statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.logClient.send('get_log_stats', {
      userId,
      startDate,
      endDate,
    });
  }
}