import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentResponseDto } from './dto/document-response.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private readonly uploadDir: string;
  private readonly maxFileSize: number;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.uploadDir = this.configService.get('UPLOAD_DIR') || './uploads';
    this.maxFileSize = parseInt(this.configService.get('MAX_FILE_SIZE_BYTES') || '10485760');
  }

  async uploadFile(file: Express.Multer.File): Promise<DocumentResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF files are allowed');
    }

    // Validate file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
    }

    try {
      // Generate unique filename
      const storedFilename = `${uuidv4()}.pdf`;
      const resolvedUploadDir = path.resolve(this.uploadDir);
      const filepath = path.join(resolvedUploadDir, storedFilename);

      // Ensure upload directory exists
      if (!fs.existsSync(resolvedUploadDir)) {
        fs.mkdirSync(resolvedUploadDir, { recursive: true });
      }

      // Save file to disk
      fs.writeFileSync(filepath, file.buffer);

      this.logger.log(`File saved: ${filepath}`);

      // Save metadata to database
      const document = await this.prisma.document.create({
        data: {
          originalFilename: file.originalname,
          storedFilename: storedFilename,
          filepath: filepath,
          filesize: file.size,
        },
      });

      return new DocumentResponseDto(document);
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  async findAll(): Promise<DocumentResponseDto[]> {
    try {
      const documents = await this.prisma.document.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });

      return documents.map(doc => new DocumentResponseDto(doc));
    } catch (error) {
      this.logger.error(`Error fetching documents: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to fetch documents: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<{ path: string; originalFilename: string }> {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Check if file exists on disk
    if (!fs.existsSync(document.filepath)) {
      this.logger.warn(`File not found on disk: ${document.filepath}`);
      throw new NotFoundException(`File for document ID ${id} not found on disk`);
    }

    return {
      path: document.filepath,
      originalFilename: document.originalFilename,
    };
  }

  async remove(id: number): Promise<void> {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    try {
      // Delete file from disk
      if (fs.existsSync(document.filepath)) {
        fs.unlinkSync(document.filepath);
        this.logger.log(`File deleted from disk: ${document.filepath}`);
      } else {
        this.logger.warn(`File not found on disk: ${document.filepath}`);
      }

      // Delete record from database
      await this.prisma.document.delete({
        where: { id },
      });

      this.logger.log(`Document deleted from database: ID ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting document: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to delete document: ${error.message}`);
    }
  }
}

