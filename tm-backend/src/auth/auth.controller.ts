import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import {  PasswordlessLoginDTO } from './dto/login.dto.js';
import type { Request } from 'express';
import { Public } from '../permission/decorations/public.decorator.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('passwordless-login')
  @Public()
  async passwordlessLogin(@Body() dto: PasswordlessLoginDTO) {
    const user = await this.authService.loginByEmail(dto);
    return {
      message: 'Login successfully',
      data: user
    };
  }

  @Get('me')
  async me(@Req() req: Request) {
    return req.user;
  }

}
