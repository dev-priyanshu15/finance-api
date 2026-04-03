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
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateMe(userId: string, dto: UpdateUserDto) {
    if (dto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Email already in use');
      }
    }
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        
      },
    });
    return updatedUser;
  }

  async deleteMe(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        refreshToken: null,
      },
    });
    return { message: 'User account deleted successfully' };
  }

  // async updateAvatar(userId: string, filename: string) {
  //   const avatarUrl = `/uploads/avatars/${filename}`;
  //   const user = await this.prisma.user.update({
  //     where: { id: userId },
  //     // avatar removed
  //     select: {
  //       id: true,
  //       name: true,
  //       email: true,
        
  //     },
  //   });
  //   return user;
  // }

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
    const user = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!user) throw new NotFoundException('User not found');
    if (dto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser && existingUser.id !== targetId) {
        throw new BadRequestException('Email already in use');
      }
    }
    const updatedUser = await this.prisma.user.update({
      where: { id: targetId },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        
      },
    });
    return updatedUser;
  }

  async deleteUser(targetId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.update({
      where: { id: targetId },
      data: { isDeleted: true, refreshToken: null },
    });
    return { message: 'User deleted successfully' };
  }

  async restoreUser(targetId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetId },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!user.isDeleted) throw new BadRequestException('User is not deleted');
    await this.prisma.user.update({
      where: { id: targetId },
      data: { isDeleted: false },
    });
    return { message: 'User restored successfully' };
  }
}