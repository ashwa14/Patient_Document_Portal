import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { DocumentResponseDto } from './dto/document-response.dto';
import { ConfigService } from '@nestjs/config';
import { memoryStorage } from 'multer';

// 🔥 Define multer options OUTSIDE the class
const MAX_FILE_SIZE =
  Number(process.env.MAX_FILE_SIZE_BYTES) || 10_000_000;

const multerOptions = {
  storage: memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
};

@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private configService: ConfigService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerOptions))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<DocumentResponseDto> {
    return this.documentsService.uploadFile(file);
  }

  @Get()
  async findAll(): Promise<DocumentResponseDto[]> {
    return this.documentsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    const { path: filePath, originalFilename } =
      await this.documentsService.findOne(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${originalFilename}"`,
    );

    // ✅ FIXED: Send absolute path directly (NO root)
    return res.sendFile(filePath);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.documentsService.remove(id);
  }
}
