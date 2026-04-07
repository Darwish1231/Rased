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
      return true; // مفيش @Roles يبقى مسموح للكل
    }

    const request = context.switchToHttp().getRequest();
    const userProfile = request.user?.profile;

    if (!userProfile) {
      throw new ForbiddenException('لم يتم العثور على بروفايل المستخدم');
    }

    const hasRole = requiredRoles.includes(userProfile.role);
    if (!hasRole) {
      throw new ForbiddenException('صلاحياتك لا تسمح لك بالقيام بهذا الإجراء');
    }

    return true;
  }
}
