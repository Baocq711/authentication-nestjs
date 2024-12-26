import { AuthModule } from '@/modules/account/auth/auth.module';
import { DatabaseModule } from '@/modules/database/database.module';
import { PermissionModule } from '@/modules/account/permission/permission.module';
import { RoleModule } from '@/modules/account/role/role.module';
import { UserModule } from '@/modules/account/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: +process.env.DB_PORT || 5432,
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || '123456',
      database: process.env.DB_NAME || 'project1',
      autoLoadEntities: true,
      synchronize: true,
      dropSchema: process.env.SHOULD_CLEAR_DB === 'true',
    }),
    CacheModule.register({
      ttl: 0,
      isGlobal: true,
    }),
    UserModule,
    AuthModule,
    RoleModule,
    DatabaseModule,
    PermissionModule,
  ],
})
export class AppModule {}
