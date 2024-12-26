import { BaseColumnEntity } from '@/core';
import { Role } from '@/modules/account/role/entities/role.entity';
import { Column, Entity, ManyToMany, Relation } from 'typeorm';

@Entity()
export class Permission extends BaseColumnEntity {
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  path: string;

  @Column({ nullable: false })
  method: string;

  @Column({ nullable: false })
  module: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Relation<Role[]>;
}
