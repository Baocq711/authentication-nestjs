import { IsUniqueArray } from '@/core';
import { Permission } from '@/modules/account/permission/entities/permission.entity';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateRoleDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Permission)
  @IsArray()
  @IsUniqueArray({ message: 'Mã quyền hạn không được trùng' })
  permissions?: Permission[];
}
