import { ADMIN_ROLE, INIT_API_PATH, USER_ROLE } from '@/modules/database/sample';
import { Permission } from '@/modules/account/permission/entities/permission.entity';
import { Role } from '@/modules/account/role/entities/role.entity';
import { User } from '@/modules/account/user/entities/user.entity';
import { UserService } from '@/modules/account/user/user.service';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class DatabaseService implements OnModuleInit {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly userService: UserService,

    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  private readonly logger = new Logger('DatabaseService', {
    timestamp: true,
  });

  onModuleInit = async () => {
    if (process.env.SHOULD_INIT === 'false') {
      return;
    }
    const userRole = await this.roleRepository.findOneBy({ name: USER_ROLE });
    if (userRole) await this.cache.set('userRoleId', userRole, 0);

    await this.initPermissions();
    await this.initRoles();
    await this.initUsers();
  };

  initPermissions = async () => {
    if ((await this.permissionRepository.count({})) !== 0) {
      return;
    }
    this.logger.log('Init Permissions');
    const permissions = this.permissionRepository.create(INIT_API_PATH);
    await this.permissionRepository.save(permissions);
  };

  initRoles = async () => {
    if ((await this.roleRepository.count({})) !== 0) {
      return;
    }
    this.logger.log('Init Roles');
    const permissions = await this.permissionRepository.find();
    const roles = this.roleRepository.create([
      {
        name: ADMIN_ROLE,
        permissions: permissions,
      },
      {
        name: USER_ROLE,
        permissions: [],
      },
    ]);
    await this.roleRepository.save(roles);
  };

  initUsers = async () => {
    if ((await this.userRepository.count({})) !== 0) {
      return;
    }
    this.logger.log('Init Users');

    const adminRole = await this.roleRepository.findOneBy({ name: ADMIN_ROLE });
    const userRole = await this.roleRepository.findOneBy({ name: USER_ROLE });
    this.cache.set('userRoleId', userRole.id, 0);

    const users = this.userRepository.create([
      {
        username: process.env.ADMIN_USERNAME || 'admin',
        password: await this.userService.hashPassword(process.env.INIT_PASSWORD || '123456'),
        role: adminRole,
        isActivated: true,
      },
      {
        username: 'user',
        password: await this.userService.hashPassword(process.env.INIT_PASSWORD || '123456'),
        role: userRole,
        isActivated: true,
      },
    ]);
    await this.userRepository.save(users);
  };
}
