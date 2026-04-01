import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('todos')
export class TodoController {
  constructor(private todoService: TodoService) {}

  @Post()
  create(@GetUser('id') userId: string, @Body() dto: CreateTodoDto) {
    return this.todoService.create(userId, dto);
  }

  @Get()
  findAll(
    @GetUser('id') userId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.todoService.findAll(userId, +page, +limit);
  }

  @Get(':id')
  findOne(@GetUser('id') userId: string, @Param('id') todoId: string) {
    return this.todoService.findOne(userId, todoId);
  }

  @Patch(':id')
  update(
    @GetUser('id') userId: string,
    @Param('id') todoId: string,
    @Body() dto: UpdateTodoDto,
  ) {
    return this.todoService.update(userId, todoId, dto);
  }

  @Delete(':id')
  remove(@GetUser('id') userId: string, @Param('id') todoId: string) {
    return this.todoService.remove(userId, todoId);
  }
}