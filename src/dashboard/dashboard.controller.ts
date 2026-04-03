import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@GetUser('id') userId: string) {
    return this.dashboardService.getSummary(userId);
  }

  @Get('category-breakdown')
  getCategoryBreakdown(@GetUser('id') userId: string) {
    return this.dashboardService.getCategoryBreakdown(userId);
  }

  @Get('monthly-trends')
  getMonthlyTrends(@GetUser('id') userId: string) {
    return this.dashboardService.getMonthlyTrends(userId);
  }

  @Get('recent-activity')
  getRecentActivity(@GetUser('id') userId: string) {
    return this.dashboardService.getRecentActivity(userId);
  }
}