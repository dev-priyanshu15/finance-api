import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRecordDto) {
    return this.prisma.financialRecord.create({
      data: {
        ...dto,
        date: new Date(dto.date),
        userId,
      },
    });
  }

  async findAll(userId: string, page: number, limit: number, type?: string, category?: string) {
    const skip = (page - 1) * limit;
    const where: any = { userId, isDeleted: false };
    if (type) where.type = type;
    if (category) where.category = category;

    const [records, total] = await Promise.all([
      this.prisma.financialRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.financialRecord.count({ where }),
    ]);

    return {
      data: records,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(userId: string, recordId: string) {
    const record = await this.prisma.financialRecord.findUnique({
      where: { id: recordId },
    });
    if (!record || record.isDeleted) throw new NotFoundException('Record not found');
    if (record.userId !== userId) throw new ForbiddenException('Access denied');
    return record;
  }

  async update(userId: string, recordId: string, dto: UpdateRecordDto) {
    await this.findOne(userId, recordId);
    return this.prisma.financialRecord.update({
      where: { id: recordId },
      data: {
        ...dto,
        date: dto.date ? new Date(dto.date) : undefined,
      },
    });
  }

  async remove(userId: string, recordId: string) {
    await this.findOne(userId, recordId);
    await this.prisma.financialRecord.update({
      where: { id: recordId },
      data: { isDeleted: true },
    });
    return { message: 'Record deleted successfully' };
  }
}