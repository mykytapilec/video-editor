import { Controller, Post, Body } from '@nestjs/common';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('url')
  async uploadUrls(@Body() dto: CreateUploadDto) {
    try {
      const videos = await this.uploadsService.createFromUrls(
        dto.userId,
        dto.urls,
      );
      return videos.map((v) => ({
        id: v.id,
        originalUrl: v.originalUrl,
        directUrl: v.directUrl,
        sourcePath: v.sourcePath,
        meta: v.meta,
        status: v.status,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { error: message };
    }
  }
}
