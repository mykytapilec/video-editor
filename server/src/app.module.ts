import { Module, DynamicModule } from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
  ConfigModuleOptions,
} from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { GroupsModule } from './groups/groups.module';
import { RenderModule } from './render/render.module';
import { UploadsModule } from './uploads/uploads.module';

const envValidationSchema: Joi.ObjectSchema<Record<string, unknown>> =
  Joi.object({
    DATABASE_HOST: Joi.string().default('localhost'),
    DATABASE_PORT: Joi.number().default(5432),
    DATABASE_USER: Joi.string().required(),
    DATABASE_PASSWORD: Joi.string().required(),
    DATABASE_NAME: Joi.string().required(),
  });

@Module({
  imports: [
    GroupsModule,
    RenderModule,
    UploadsModule,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'exports'),
      serveRoot: '/exports',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validationSchema: envValidationSchema,
    } satisfies ConfigModuleOptions),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASSWORD'),
        database: config.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }) satisfies DynamicModule,
  ],
})
export class AppModule {}
