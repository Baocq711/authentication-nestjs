import { Cookies, DUser, Public } from '@/core';
import { AuthService } from '@/modules/account/auth/auth.service';
import { LocalAuthGuard } from '@/modules/account/auth/local-auth.guard';
import { CreateUserDto } from '@/modules/account/user/dto/create-user.dto';
import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Guard chạy vào file local.stategy.ts
  @UseGuards(LocalAuthGuard)
  @Public()
  @Post('signin')
  async signin(@DUser() user: UserByAccessToken, @Res({ passthrough: true }) res: Response) {
    return this.authService.signin(user, res);
  }

  @Post('signout')
  async signout(@DUser() user: UserByAccessToken, @Res({ passthrough: true }) res: Response) {
    return this.authService.signout(user, res);
  }

  @Post('signup')
  @Public()
  async signup(@Body() user: CreateUserDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signup(user, res);
  }

  @Get('refresh')
  @Public()
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @Cookies('refresh_token') refreshToken: string,
  ) {
    return this.authService.refresh(refreshToken, res);
  }

  @Get('profile')
  profile(@DUser() user: UserByAccessToken) {
    return this.authService.profile(user);
  }
}
