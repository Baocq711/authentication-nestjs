import { AuthController } from '@/modules/account/auth/auth.controller';
import { AuthService } from '@/modules/account/auth/auth.service';
import { JwtStrategy } from '@/modules/account/auth/jwt.strategy';
import { LocalStrategy } from '@/modules/account/auth/local.strategy';
import { Permission } from '@/modules/account/permission/entities/permission.entity';
import { Role } from '@/modules/account/role/entities/role.entity';
import { UserModule } from '@/modules/account/user/user.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRE,
        algorithm: 'HS512',
      },
    }),
    TypeOrmModule.forFeature([Role, Permission]),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
