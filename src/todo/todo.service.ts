import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoGateway } from '../gateway/todo.gateway';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService, private todoGateway: TodoGateway,) {}
  //create todo
async create(userId: string, dto: CreateTodoDto) {
  const todo = await this.prisma.todo.create({
    data: {
      ...dto,
      userId,
    },
  });
  this.todoGateway.emitTodoCreated(userId, todo);
  return todo;
}
//findall todos of a user
async findAll(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [todos, total] = await Promise.all([
    this.prisma.todo.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.todo.count({
      where: { userId },
    }),
  ]);

  return {
    data: todos,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
async findOne(userId: string, todoId: string) {
  const todo = await this.prisma.todo.findUnique({
    where: { id: todoId },
  });
  if (!todo) throw new NotFoundException('Todo not found');
  if (todo.userId !== userId) throw new ForbiddenException('Access denied');
  return todo;
}
//update todo
async update(userId: string, todoId: string, dto: UpdateTodoDto) {
  await this.findOne(userId, todoId);
  const todo = await this.prisma.todo.update({
    where: { id: todoId },
    data: dto,
  });
  this.todoGateway.emitTodoUpdated(userId, todo);
  return todo;
}
//remove todo
async remove(userId: string, todoId: string) {
  await this.findOne(userId, todoId);
  await this.prisma.todo.delete({ where: { id: todoId } });
  this.todoGateway.emitTodoDeleted(userId, todoId);
  return { message: 'Todo deleted successfully' };
}
}