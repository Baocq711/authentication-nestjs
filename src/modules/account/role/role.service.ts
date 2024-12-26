import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EntityPropertyNotFoundError, Repository } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '@/modules/account/role/entities/role.entity';
import { isNestJsException, PaginationDto } from '@/core';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  private readonly logger = new Logger(RoleService.name, {
    timestamp: true,
  });

  create = async (createRoleDto: CreateRoleDto) => {
    try {
      createRoleDto.name = createRoleDto.name.trim().toUpperCase();
      if (await this.roleRepository.existsBy({ name: createRoleDto.name })) {
        throw new UnprocessableEntityException(`Vai trò đã tồn tại`);
      }

      const record = this.roleRepository.create(createRoleDto);
      record.permissions = createRoleDto?.permissions;

      const created = await this.roleRepository.save(record);
      return {
        id: created.id,
        createdAt: created.createdAt,
      };
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      if (error.code === '23503') {
        throw new NotFoundException('Dữ liệu quan hệ không tồn tại');
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Lỗi tạo vai trò');
    }
  };

  findAll = async ({ limit, order, orderBy, page, withDeleted }: PaginationDto) => {
    try {
      const [data, totalRecords] = await this.roleRepository.findAndCount({
        order: { [orderBy]: order },
        take: limit,
        skip: (page - 1) * limit,
        withDeleted,
        loadRelationIds: true,
      });

      return {
        meta: {
          page,
          limit,
          totalRecords,
          totalPage: Math.ceil(totalRecords / limit),
        },
        data,
      };
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      if (error instanceof EntityPropertyNotFoundError) {
        throw new NotFoundException('Không tìm thấy trường cần sắp xếp');
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Lỗi lấy danh sách vai trò');
    }
  };

  findOne = async (id: string) => {
    try {
      const record = await this.roleRepository.findOne({ where: { id }, loadRelationIds: true });

      if (!record) {
        throw new NotFoundException('Không tìm thấy vai trò');
      }

      return record;
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Lỗi lấy thông tin vai trò');
    }
  };

  update = async (id: string, updateRoleDto: UpdateRoleDto) => {
    try {
      const record = await this.findOne(id);

      if (await this.roleRepository.existsBy({ name: updateRoleDto.name })) {
        throw new UnprocessableEntityException(`Vai trò đã tồn tại`);
      }

      if (updateRoleDto.permissions) record.permissions = updateRoleDto.permissions;

      this.roleRepository.merge(record, updateRoleDto);

      const updated = await this.roleRepository.save(record);
      return {
        id: updated.id,
        updatedAt: updated.updatedAt,
      };
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      if (error.code === '23503') {
        throw new NotFoundException('Dữ liệu quan hệ không tồn tại');
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Lỗi cập nhật vai trò');
    }
  };

  remove = async (id: string) => {
    try {
      const record = await this.findOne(id);

      const deleted = await this.roleRepository.softRemove(record);

      return {
        id: deleted.id,
        deletedAt: deleted.deletedAt,
      };
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Lỗi xóa vai trò');
    }
  };
}
