import { BaseColumnEntity } from '@/core';
import { Permission } from '@/modules/account/permission/entities/permission.entity';
import { User } from '@/modules/account/user/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany, Relation } from 'typeorm';

@Entity()
export class Role extends BaseColumnEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  isActivated: boolean;

  @OneToMany(() => User, (user) => user.role)
  users: Relation<User[]>;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable()
  permissions: Relation<Permission[]>;
}
