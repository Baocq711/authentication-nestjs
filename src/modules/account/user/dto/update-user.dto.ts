import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsDate, IsEmail, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  @Type(() => Date) // Chuyển đổi chuỗi thành Date
  @IsDate()
  birthday?: Date;

  @IsOptional()
  avatar?: string;

  @IsNumber()
  @IsOptional()
  age?: number;

  @IsOptional()
  @IsString()
  @IsIn(['male', 'female', 'other'])
  gender?: string;

  @IsOptional()
  @IsBoolean()
  isActivated?: boolean;
}
