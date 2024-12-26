import { IS_PUBLIC_KEY, isNestJsException } from '@/core';
import { Permission } from '@/modules/account/permission/entities/permission.entity';
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { isArray, isNotEmptyObject } from 'class-validator';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<UserByAccessToken>(
    err: any,
    { permissions, ...user }: UserByAccessToken & { permissions: Permission[] },
    info: any,
    ctx: ExecutionContext,
  ) {
    try {
      const request: Request = ctx.switchToHttp().getRequest();

      if (err || !isNotEmptyObject(user)) {
        throw err || new UnauthorizedException('Không xác thực được người dùng');
      }

      const tagretMethod = request.method.toUpperCase();
      // Cắt bỏ /api/v1/ để lấy ra path cần kiểm tra quyền
      const targetPath = '/' + (request.route?.path as string).split('/').slice(3).join('/');

      if (
        !isArray(permissions) ||
        !permissions.some((permission) => {
          return permission.method === tagretMethod && permission.path === targetPath;
        })
      ) {
        throw new ForbiddenException('Không có quyền truy cập');
      }

      return user;
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      throw new InternalServerErrorException('Lỗi phân quyền người dùng');
    }
  }
}
