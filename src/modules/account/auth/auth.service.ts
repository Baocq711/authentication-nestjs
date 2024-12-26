import { isNestJsException } from '@/core';
import { CreateUserDto } from '@/modules/account/user/dto/create-user.dto';
import { UserService } from '@/modules/account/user/user.service';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isNotEmptyObject } from 'class-validator';
import { Response } from 'express';
import ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  validateUser = async (username: string, pass: string): Promise<any> => {
    try {
      const { password, ...user } = (await this.userService.findOneByUsername(username)) ?? {};
      if (isNotEmptyObject(user) && (await this.userService.comparePassword(pass, password))) {
        return user;
      }
      return null;
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Lỗi xác thực người dùng');
    }
  };

  signin = async (user: UserByAccessToken, res: Response) => {
    try {
      const refreshToken = this.createRefreshToken(user);

      await this.userService.updateRefreshToken(user.id, refreshToken);

      res.cookie('refresh_token', refreshToken, {
        maxAge: ms(process.env.REFRESH_TOKEN_EXPIRE ?? '1d'),
        httpOnly: true,
      });

      return {
        access_token: this.jwtService.sign(user),
      };
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Lỗi khi đăng nhập');
    }
  };

  signup = async (user: CreateUserDto, res: Response) => {
    try {
      await this.userService.create(user);

      const record = await this.userService.findOneByUsername(user.username);
      return this.signin(
        {
          id: record.id,
          role: { id: record.role.id },
        },
        res,
      );
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Lỗi khi đăng ký');
    }
  };

  signout = async (user: UserByAccessToken, res: Response) => {
    try {
      await this.userService.updateRefreshToken(user.id, null);
      res.clearCookie('refresh_token');
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Lỗi khi đăng xuất');
    }
  };

  profile = async (user: UserByAccessToken) => {
    try {
      return await this.userService.findOne(user.id);
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Lỗi khi lấy thông tin người dùng');
    }
  };

  createRefreshToken = (user: UserByAccessToken) =>
    this.jwtService.sign(user, {
      secret: process.env.REFRESH_TOKEN_SECRET || 'REFRESH_TOKEN_SECRET',
      algorithm: 'HS512',
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '1d',
    });

  refresh = async (refreshToken: string, res: Response) => {
    try {
      const payload: UserByAccessToken & { iat: string; exp: string } = await this.jwtService
        .verifyAsync(refreshToken, {
          algorithms: ['HS512'],
          secret: process.env.REFRESH_TOKEN_SECRET || 'REFRESH_TOKEN_SECRET',
        })
        .catch(() => {
          throw new BadRequestException('Refresh token không hợp lệ');
        });

      if (!(await this.userService.findOneByRefreshToken(refreshToken))) {
        throw new BadRequestException('Refresh token không hợp lệ');
      }

      const user = {
        id: payload.id,
        role: payload.role,
      };

      return this.signin(user, res);
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Lỗi khi làm mới token');
    }
  };
}
