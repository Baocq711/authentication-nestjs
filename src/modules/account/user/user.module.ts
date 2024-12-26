import { User } from '@/modules/account/user/entities/user.entity';
import { UserController } from '@/modules/account/user/user.controller';
import { UserService } from '@/modules/account/user/user.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
