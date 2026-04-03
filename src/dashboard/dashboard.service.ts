import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    const records = await this.prisma.financialRecord.findMany({
      where: { userId, isDeleted: false },
    });

    const totalIncome = records
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0);

    const totalExpenses = records
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      totalRecords: records.length,
    };
  }

  async getCategoryBreakdown(userId: string) {
    const records = await this.prisma.financialRecord.findMany({
      where: { userId, isDeleted: false },
      select: { category: true, amount: true, type: true },
    });

    const breakdown: Record<string, { income: number; expense: number }> = {};

    for (const r of records) {
      if (!breakdown[r.category]) {
        breakdown[r.category] = { income: 0, expense: 0 };
      }
      if (r.type === 'income') breakdown[r.category].income += r.amount;
      else breakdown[r.category].expense += r.amount;
    }

    return Object.entries(breakdown).map(([category, data]) => ({
      category,
      ...data,
      net: data.income - data.expense,
    }));
  }

  async getMonthlyTrends(userId: string) {
    const records = await this.prisma.financialRecord.findMany({
      where: { userId, isDeleted: false },
      select: { amount: true, type: true, date: true },
      orderBy: { date: 'asc' },
    });

    const monthly: Record<string, { income: number; expense: number }> = {};

    for (const r of records) {
      const key = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthly[key]) monthly[key] = { income: 0, expense: 0 };
      if (r.type === 'income') monthly[key].income += r.amount;
      else monthly[key].expense += r.amount;
    }

    return Object.entries(monthly).map(([month, data]) => ({
      month,
      ...data,
      net: data.income - data.expense,
    }));
  }

  async getRecentActivity(userId: string) {
    return this.prisma.financialRecord.findMany({
      where: { userId, isDeleted: false },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }
}