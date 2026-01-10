import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { Video } from '../render/render.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Video])],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
