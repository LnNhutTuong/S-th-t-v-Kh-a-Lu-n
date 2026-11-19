import { Controller, Post, Body, Get, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { PasswordlessLoginDTO } from './dto/login.dto.js';
import { Public } from '../permission/decorators/public.decorator.js';
import { InternalKeyGuard } from './guards/internal-key.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(InternalKeyGuard)
  @Post('passwordless-login')
  async passwordlessLogin(@Body() dto: PasswordlessLoginDTO) {
    return await this.authService.loginByEmail(dto);
  }

  @Public()
  @UseGuards(InternalKeyGuard)
  @Post('check-email')
  async checkMail(@Body('email') email: string){
    return await this.authService.checkEmail(email);
  }

  @Get('me')
  async getMe(@Req() req: any){
    return await this.authService.getMe(req.user.id);
  }
}
