import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No @Roles decorator means public access is allowed
    }

    const request = context.switchToHttp().getRequest();
    const userProfile = request.user?.profile;

    if (!userProfile) {
      throw new ForbiddenException('User profile not found');
    }

    // 1. Extract user role from Firestore profile
    const userRole = userProfile?.role;
    
    // 2. Direct email check as a fail-safe for the primary administrator account
    const userEmail = request.user?.email || '';
    const isAdminEmail = userEmail.toLowerCase() === 'admin1@rased.com';

    // 3. Grant immediate access if the user is the primary admin and admin role is required
    if (isAdminEmail && requiredRoles.includes('admin')) {
      return true;
    }

    const hasRole = userRole && requiredRoles.includes(userRole);
    if (!hasRole) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }

    return true;
  }
}
