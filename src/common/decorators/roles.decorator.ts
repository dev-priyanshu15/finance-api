import { SetMetadata } from '@nestjs/common';

export enum Role {
  VIEWER = 'VIEWER',
  ANALYST = 'ANALYST',
  ADMIN = 'ADMIN',
}

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);