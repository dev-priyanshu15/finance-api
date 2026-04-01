import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}
  //create todo
async create(userId: string, dto: CreateTodoDto) {
  return this.prisma.todo.create({
    data: {
      ...dto,
      userId,
    },
  });
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
  return this.prisma.todo.update({
    where: { id: todoId },
    data: dto,
  });
}
//remove todo
async remove(userId: string, todoId: string) {
  await this.findOne(userId, todoId);  
  await this.prisma.todo.delete({
    where: { id: todoId },
  });
  return { message: 'Todo deleted successfully' };
}
}