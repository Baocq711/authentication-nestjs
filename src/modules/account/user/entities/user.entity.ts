import { BaseColumnEntity } from '@/core';
import { Role } from '@/modules/account/role/entities/role.entity';
import { Column, Entity, Index, ManyToOne } from 'typeorm';

@Entity()
export class User extends BaseColumnEntity {
  @Index()
  @Column()
  username: string;

  @Column({ select: false })
  password: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  birthday: Date;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true })
  gender: string;

  @Column({ default: false })
  isActivated: boolean;

  @Column({ nullable: true, select: false })
  refreshToken: string;

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;
}
