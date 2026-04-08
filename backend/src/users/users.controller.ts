import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * جلب الأكونت الخاص بالمستخدم
   */
  @Get('me')
  async getMyProfile(@Req() req: any) {
    const profile = await this.usersService.getUserById(req.user.uid);
    return { ...profile, authEmail: req.user.email };
  }

  /**
   * إنشاء البروفايل أول مرة بعد التسجيل في Firebase
   */
  @Post('profile')
  async createProfile(@Body() body: any, @Req() req: any) {
    // هنتأكد إنه بينشئ البروفايل لنفسه
    return this.usersService.createUserProfile(req.user.uid, {
      ...body,
      email: req.user.email
    });
  }

  /**
   * جلب كل المستخدمين (صلاحية للأدمن فقط)
   */
  @Get()
  @Roles('admin')
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  /**
   * تعديل دور أي مستخدم (ترقية لمشرف مثلاً)
   */
  @Put(':id/role')
  @Roles('admin')
  async updateUserRole(
    @Param('id') id: string, 
    @Body('role') role: string, 
    @Body('stationScopes') stationScopes: string[]
  ) {
    return this.usersService.updateUserRole(id, role, stationScopes);
  }
}
