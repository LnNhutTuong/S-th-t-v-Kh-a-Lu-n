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
    const user = await this.authService.loginByEmail(dto);
    return {
      message: 'Login successfully',
      data: user
    };
  }


  
}
