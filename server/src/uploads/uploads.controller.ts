import { Controller, Post, Body } from '@nestjs/common';
import { CreateUploadDto } from './dto/create-upload.dto';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('url')
  async uploadUrls(@Body() dto: CreateUploadDto) {
    const { userId, urls } = dto;
    try {
      const videos = await this.uploadsService.createFromUrls(userId, urls);
      return videos.map((v) => ({
        id: v.id,
        originalUrl: v.originalUrl,
        directUrl: v.directUrl,
        status: v.status,
        meta: v.meta,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      return { error: message };
    }
  }
}
