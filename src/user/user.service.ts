import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getMe(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      // password: false ← mat likho — select mein na hoga toh aayega hi nahi
    },
  });
  if (!user) throw new NotFoundException('User not found');
  return user;
}
async updateMe(userId: string, dto: UpdateUserDto) {
  // step 1: email duplicate check (agar dto.email hai toh)
    if (dto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
    }

  // step 2: prisma.user.update()
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });

  // step 3: select mein id, name, email, avatar return karo
    return updatedUser;
}
//deletemeMe method
async deleteMe(userId: string) {
  await this.prisma.user.update({
    where: { id: userId },
    data: { 
        isDeleted: true,
        refreshToken: null 
     },
  });
  return { message: 'User account deleted successfully' };
}
async getAllUsers(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    this.prisma.user.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isDeleted: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.user.count(),
  ]);

  return {
    data: users,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
async updateUser(targetId: string, dto: UpdateUserDto) {
  // step 1: user exist karta hai?
    const user = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!user) throw new NotFoundException('User not found');
     // email duplicate check (agar dto.email hai toh)
    if (dto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser && existingUser.id !== targetId) {
        throw new BadRequestException('Email already in use');
      }
    }
  // step 2: update karo
    const updatedUser = await this.prisma.user.update({
      where: { id: targetId },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    });
  // step 3: return karo
    return updatedUser;
}
//deleteUser method
async deleteUser(targetId: string) {
  // step 1: user exist karta hai?
    const user = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!user) throw new NotFoundException('User not found');

  // step 2: user delete karo
    await this.prisma.user.update({
  where: { id: targetId },
  data: { isDeleted: true, refreshToken: null },
});

  // step 3: return karo
    return { message: 'User deleted successfully' };
}
//restoreUser method
async restoreUser(targetId: string) {
  // step 1: user exist karta hai?
    const user = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!user.isDeleted) throw new BadRequestException('User is not deleted');       
    // step 2: user restore karo
    await this.prisma.user.update({
      where: { id: targetId },
      data: { isDeleted: false },
    });
    // step 3: return karo
    return { message: 'User restored successfully' };
}
}

