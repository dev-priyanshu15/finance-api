import { Controller, Get, Patch, Delete, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';
import { GetUser } from '../common/decorators/get-user.decorator';
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  
@Get('me')
getMe(@GetUser('id') userId: string) {
  return this.userService.getMe(userId);
}
@Patch('me')
updateMe(@GetUser('id') userId: string, @Body() dto: UpdateUserDto) {
  return this.userService.updateMe(userId, dto);
}
@Delete('me')
deleteMe(@GetUser('id') userId: string) {
  return this.userService.deleteMe(userId);
}
@Get()
@Roles(Role.ADMIN)
@UseGuards(RolesGuard)
getAllUsers(
  @Query('page') page = '1',
  @Query('limit') limit = '10',
) {
  return this.userService.getAllUsers(+page, +limit);
}
@Patch(':id')
@Roles(Role.ADMIN)
@UseGuards(RolesGuard)
updateUser(@Param('id') targetId: string, @Body() dto: UpdateUserDto) {
  return this.userService.updateUser(targetId, dto);
}

@Delete(':id')
@Roles(Role.ADMIN)
@UseGuards(RolesGuard)
deleteUser(@Param('id') targetId: string) {
  return this.userService.deleteUser(targetId);
}

@Post(':id/restore')
@Roles(Role.ADMIN)
@UseGuards(RolesGuard)
restoreUser(@Param('id') targetId: string) {
  return this.userService.restoreUser(targetId);
}
}