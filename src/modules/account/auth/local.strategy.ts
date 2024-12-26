import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { isNestJsException } from '@/core';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  validate = async (username: string, password: string): Promise<any> => {
    try {
      const user = await this.authService.validateUser(username, password);
      if (!user) {
        throw new UnauthorizedException('Không xác thực được người dùng');
      }
      return user;
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      throw new InternalServerErrorException('Lỗi xác thực người dùng');
    }
  };
}
