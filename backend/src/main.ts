import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception-filter';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ValidationException } from './common/exceptions/ValidationException';
import ConfigService from './common/config/config.service';

const logger = new Logger('MAIN');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  
  // Get port from env or use fallback ports
  const port = configService.get('PORT') || 3000;

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  
  // swagger configuration
  const config = new DocumentBuilder()
    .setTitle("🛍️ NextStore API Documentation")
    .setDescription(
      "🚀 NextStore - Your Ultimate E-commerce Platform  \n" +
      "• 🌐 Browse through millions of products  \n" +
      "• 💫 Compare prices across sellers  \n" +
      "• 🛒 Seamless shopping experience  \n" +
      "• 📦 Fast delivery options  \n" +
      "• ⭐ Customer reviews and ratings  \n" +
      "• 💳 Secure payment gateway"
    )
    
    .setVersion("1.0")
    .build()

    const document = SwaggerModule.createDocument(app , config);
    SwaggerModule.setup("docs", app , document)


    // global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());


    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        exceptionFactory: errors => {
          const messages = errors.reduce(
            (acc, err) => {
              acc[err.property] = Object.values(err.constraints || {}).join(', ');
              return acc;
            },
            {} as Record<string, string>,
          );
  
          return new ValidationException(messages);
        },
      }),
    );

    // Enable class-transformer globally
    app.useGlobalInterceptors();

  await app.listen(port);
  logger.log(
    `Application is running on: http://localhost:${port}`,
  );
}
void bootstrap();
