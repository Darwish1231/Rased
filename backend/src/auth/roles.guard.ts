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

    // 1. استخراج الصلاحية من البروفايل (Firestore)
    const userRole = userProfile?.role;
    
    // 2. التحقق من الإيميل مباشرة كصمام أمان للأدمن الأساسي
    const userEmail = request.user?.email || '';
    const isAdminEmail = userEmail.toLowerCase() === 'admin1@rased.com';

    // 3. إذا كان المطلوب أدمن وهو معاه الإيميل ده، اسمح له فوراً
    if (isAdminEmail && requiredRoles.includes('admin')) {
      return true;
    }

    const hasRole = userRole && requiredRoles.includes(userRole);
    if (!hasRole) {
      throw new ForbiddenException('صلاحياتك لا تسمح لك بالقيام بهذا الإجراء');
    }

    return true;
  }
}
