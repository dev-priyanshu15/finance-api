import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('records')
export class RecordsController {
  constructor(private recordsService: RecordsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ANALYST', 'ADMIN')
  create(@GetUser('id') userId: string, @Body() dto: CreateRecordDto) {
    return this.recordsService.create(userId, dto);
  }

  @Get()
  findAll(
    @GetUser('id') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('type') type?: string,
    @Query('category') category?: string,
  ) {
    return this.recordsService.findAll(userId, +page, +limit, type, category);
  }

  @Get(':id')
  findOne(@GetUser('id') userId: string, @Param('id') recordId: string) {
    return this.recordsService.findOne(userId, recordId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ANALYST', 'ADMIN')
  update(
    @GetUser('id') userId: string,
    @Param('id') recordId: string,
    @Body() dto: UpdateRecordDto,
  ) {
    return this.recordsService.update(userId, recordId, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('ANALYST', 'ADMIN')
  remove(@GetUser('id') userId: string, @Param('id') recordId: string) {
    return this.recordsService.remove(userId, recordId);
  }
}