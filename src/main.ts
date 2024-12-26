import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { TransformInterceptor } from '@/core';
import { JwtAuthGuard } from '@/modules/account/auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // VALIDATION
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các thuộc tính không khai báo trong DTO
      forbidNonWhitelisted: true, // Trả lỗi nếu có thuộc tính không khai báo trong DTO
      transform: true, // Tự động chuyển đổi kiểu dữ liệu
    }),
  );

  // MIDDLEWARE
  const reflector = app.get(Reflector);
  // Chỉnh sửa dữ liệu trả về chung
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // Áp dụng jwt cho toàn bộ api trừ những api có @Public()
  // Khi gọi api sẽ chạy vào jwt-auth.guard.ts để kiểm tra token
  // Nếu token hợp lệ và userId có trong database thì chạy sang jwt.strategy.ts để kiểm tra quyền hạn
  app.useGlobalGuards(new JwtAuthGuard(reflector));

  // CONFIG
  app.use(cookieParser());
  app.use(compression());
  app.enableCors();

  // STATIC FILE
  app.useStaticAssets(join(__dirname, '..', 'public'));

  //VERSIONING
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['1'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
