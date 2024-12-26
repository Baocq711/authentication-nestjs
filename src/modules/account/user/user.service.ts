import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@/modules/account/user/entities/user.entity';
import { EntityPropertyNotFoundError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import bcrypt from 'bcrypt';
import { isNestJsException, PaginationDto } from '@/core';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
  ) {}

  private readonly logger = new Logger(UserService.name, {
    timestamp: true,
  });

  create = async (createUserDto: CreateUserDto) => {
    try {
      createUserDto.username = createUserDto.username.trim().toLowerCase();
      if (await this.userRepository.existsBy({ username: createUserDto.username })) {
        throw new UnprocessableEntityException(`Tên đăng nhập đã tồn tại`);
      }

      const record = this.userRepository.create(createUserDto);

      record.password = await this.hashPassword(createUserDto.password);
      record.role = createUserDto.role ?? (await this.cache.get('userRoleId'));

      const created = await this.userRepository.save(record);
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
      throw new InternalServerErrorException('Lỗi tạo tài khoản');
    }
  };

  findAll = async ({ limit, order, orderBy, page, withDeleted }: PaginationDto) => {
    try {
      const [data, totalRecords] = await this.userRepository.findAndCount({
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
      throw new InternalServerErrorException('Lỗi lấy danh sách tài khoản');
    }
  };

  findOne = async (id: string) => {
    try {
      const record = await this.userRepository.findOne({ where: { id }, loadRelationIds: true });

      if (!record) {
        throw new NotFoundException('Không tìm thấy tài khoản');
      }

      return record;
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Lỗi lấy thông tin tài khoản');
    }
  };

  update = async (id: string, updateUserDto: UpdateUserDto) => {
    try {
      const record = await this.findOne(id);

      Object.assign(record, updateUserDto);

      const updated = await this.userRepository.save(record);

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
      throw new InternalServerErrorException('Lỗi cập nhật tài khoản');
    }
  };

  remove = async (id: string) => {
    try {
      const record = await this.findOne(id);

      const deleted = await this.userRepository.softRemove(record);

      return {
        id: deleted.id,
        deletedAt: deleted.deletedAt,
      };
    } catch (error) {
      if (isNestJsException(error)) {
        throw error;
      }
      this.logger.error(error.message);
      throw new InternalServerErrorException('Lỗi xóa tài khoản');
    }
  };

  // PASSWORD
  hashPassword = async (password: string) =>
    bcrypt.genSalt(10).then((salt) => bcrypt.hash(password, salt));

  comparePassword = async (password: string, hash: string) =>
    bcrypt.compare(password, hash).catch((error) => {
      throw new InternalServerErrorException('Lỗi so sánh mật khẩu: ' + error.message);
    });

  // AUTHENTICATION
  findOneByUsername = async (username: string) =>
    this.userRepository.findOne({
      where: { username },
      relations: ['role'],
      select: {
        id: true,
        password: true,
        role: {
          id: true,
        },
      },
    });

  // REFRESH TOKEN
  findOneByRefreshToken = async (refreshToken: string) =>
    this.userRepository.findOne({
      where: { refreshToken },
      relations: ['role'],
      select: {
        id: true,
        role: {
          id: true,
        },
      },
    });

  updateRefreshToken = (id: string, refreshToken: string | null) =>
    this.userRepository.update({ id }, { refreshToken });
}
