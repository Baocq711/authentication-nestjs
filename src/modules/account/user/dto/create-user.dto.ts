import { Role } from '@/modules/account/role/entities/role.entity';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, Length, Matches, ValidateNested } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Length(6, 20, { message: 'Username phải có độ dài từ 6 đến 20 ký tự' })
  @Matches(/^[a-zA-Z0-9](?!.*[_.]{2})[a-zA-Z0-9._]*[a-zA-Z0-9]$/, {
    message: 'Username không hợp lệ',
  })
  username: string;

  @IsString()
  @Length(6, 32, { message: 'Password phải có độ dài từ 8 đến 32 ký tự.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/, {
    message: 'Password không hợp lệ',
  })
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Role)
  role: Role;
}
