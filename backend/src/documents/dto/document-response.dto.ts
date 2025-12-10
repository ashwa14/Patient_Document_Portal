export class DocumentResponseDto {
  id: number;
  originalFilename: string;
  storedFilename: string;
  filepath: string;
  filesize: number;
  createdAt: Date;

  constructor(document: any) {
    this.id = document.id;
    this.originalFilename = document.originalFilename;
    this.storedFilename = document.storedFilename;
    this.filepath = document.filepath;
    this.filesize = document.filesize;
    this.createdAt = document.createdAt;
  }
}

