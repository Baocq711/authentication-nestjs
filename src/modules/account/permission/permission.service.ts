import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { EntityPropertyNotFoundError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from '@/modules/account/permission/entities/permission.entity';
import { isNestJsException, PaginationDto } from '@/core';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  private readonly logger = new Logger(PermissionService.name, {
    timestamp: true,
  });

  create = async (createPermissionDto: CreatePermissionDto) => {
    try {
      createPermissionDto.name = createPermissionDto.name.trim();
      if (await this.permissionRepository.existsBy({ name: createPermissionDto.name })) {
        throw new UnprocessableEntityException(`Quyền đã tồn tại`);
      }

      const record = this.permissionRepository.create(createPermissionDto);

      const created = await this.permissionRepository.save(record);
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
      throw new InternalServerErrorException('Lỗi tạo quyền');
    }
  };

  findAll = async ({ limit, order, orderBy, page, withDeleted }: PaginationDto) => {
    try {
      const [data, totalRecords] = await this.permissionRepository.findAndCount({
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
      throw new InternalServerErrorException('Lỗi lấy danh sách quyền');
    }
  };

  findOne = async (id: string) => {
    try {
      const record = await this.permissionRepository.findOne({
        where: { id },
        loadRelationIds: true,
      });

      if (!record) {
        throw new NotFoundException('Không tìm thấy quyền');
      }

      return record;
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Lỗi lấy thông tin quyền');
    }
  };

  update = async (id: string, updatePermissionDto: UpdatePermissionDto) => {
    try {
      const record = await this.findOne(id);

      if (await this.permissionRepository.existsBy({ name: updatePermissionDto.name })) {
        throw new UnprocessableEntityException(`Quyền đã tồn tại`);
      }

      this.permissionRepository.merge(record, updatePermissionDto);

      const updated = await this.permissionRepository.save(record);
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
      throw new InternalServerErrorException('Lỗi cập nhật quyền');
    }
  };

  remove = async (id: string) => {
    try {
      const record = await this.findOne(id);

      const deleted = await this.permissionRepository.softRemove(record);

      return {
        id: deleted.id,
        deletedAt: deleted.deletedAt,
      };
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Lỗi xóa quyền');
    }
  };
}
