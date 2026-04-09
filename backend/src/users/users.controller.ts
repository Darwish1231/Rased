import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Fetch authenticated user's own profile.
   */
  @Get('me')
  async getMyProfile(@Req() req: any) {
    const profile = await this.usersService.getUserById(req.user.uid);
    return { ...profile, authEmail: req.user.email };
  }

  /**
   * Create a user profile upon initial Firebase registration.
   */
  @Post('profile')
  async createProfile(@Body() body: any, @Req() req: any) {
    // Ensure the profile is created for the authenticated user only
    return this.usersService.createUserProfile(req.user.uid, {
      ...body,
      email: req.user.email
    });
  }

  /**
   * Retrieve all user profiles (Admin access only).
   */
  @Get()
  @Roles('admin')
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  /**
   * Update a user's role and station access permissions.
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
