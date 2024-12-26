import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '@/modules/account/permission/entities/permission.entity';
import { isNestJsException } from '@/core';
import { UserService } from '@/modules/account/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.ACCESS_TOKEN_SECRET,
    });
  }
  async validate(
    payload: UserByAccessToken & {
      iat: number;
      exp: number;
    },
  ) {
    try {
      const [permissions, user] = await Promise.all([
        this.permissionRepository.find({
          where: { roles: { id: payload.role.id } },
        }),
        this.userService.findOne(payload.id),
      ]);

      if (!user) {
        throw new NotFoundException('Người dùng không tồn tại');
      }

      return {
        id: payload.id,
        role: payload.role,
        permissions,
      };
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      throw new InternalServerErrorException('Lỗi lấy thông tin người dùng từ token');
    }
  }
}
