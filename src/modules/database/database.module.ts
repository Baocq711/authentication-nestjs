import { DatabaseService } from '@/modules/database/database.service';
import { Permission } from '@/modules/account/permission/entities/permission.entity';
import { Role } from '@/modules/account/role/entities/role.entity';
import { User } from '@/modules/account/user/entities/user.entity';
import { UserModule } from '@/modules/account/user/user.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role, User]), UserModule],
  providers: [DatabaseService],
})
export class DatabaseModule {}
