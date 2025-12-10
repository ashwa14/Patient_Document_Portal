# Patient Document Portal - Design Document

## Architecture Overview

The Patient Document Portal is a full-stack application with a clear separation between frontend and backend, communicating via RESTful API endpoints.

### Technology Choices

#### Frontend: Next.js (App Router) + TypeScript

**Why Next.js?**
- **Server-Side Rendering (SSR) & Static Site Generation**: Provides excellent performance and SEO benefits
- **App Router**: Modern, file-based routing system with better developer experience
- **Built-in Optimizations**: Automatic code splitting, image optimization, and performance optimizations
- **TypeScript Support**: First-class TypeScript support for type safety
- **Developer Experience**: Hot module reloading, excellent tooling, and extensive ecosystem
- **API Routes**: Can handle server-side logic if needed (though we use external backend)
- **Production Ready**: Battle-tested framework used by major companies

#### Backend: NestJS + TypeScript

**Why NestJS?**
- **Modular Architecture**: Built on top of Express but with a modular structure similar to Angular
- **TypeScript First**: Native TypeScript support with decorators and dependency injection
- **Enterprise-Ready**: Designed for scalable, maintainable applications
- **Built-in Features**: Validation, exception handling, guards, interceptors out of the box
- **Prisma Integration**: Easy integration with ORMs like Prisma
- **Testing**: Excellent testing utilities and support
- **Documentation**: Comprehensive documentation and active community

#### Database: PostgreSQL

**Why PostgreSQL?**
- **Reliability**: ACID compliant, robust and battle-tested
- **Rich Data Types**: Support for JSON, arrays, and custom types
- **Performance**: Excellent query performance, indexing capabilities
- **Open Source**: Free and open-source with active development
- **Scalability**: Can handle large datasets and concurrent connections
- **Prisma Support**: Excellent integration with Prisma ORM

#### ORM: Prisma

**Why Prisma?**
- **Type Safety**: Auto-generated TypeScript types from schema
- **Developer Experience**: Excellent tooling (Prisma Studio, migrations)
- **Performance**: Efficient queries with minimal overhead
- **Database Agnostic**: Easy to switch databases if needed
- **Migration Management**: Built-in migration system
- **Intuitive API**: Clean, intuitive query API

#### File Storage: Local Filesystem

**Current Implementation:**
- Files stored in `backend/uploads/` directory
- UUID-based filenames to prevent collisions
- Original filenames stored in database for display

**Limitations:**
- Not suitable for multi-server deployments
- No redundancy or backup
- Limited scalability

**Future Scaling:**
- Move to cloud storage (AWS S3, Azure Blob Storage, Google Cloud Storage)
- Implement CDN for file delivery
- Add file versioning and backup strategies

## System Architecture

```
┌─────────────────┐
│   Web Browser   │
│  (Next.js App)  │
│  Port: 3000     │
└────────┬────────┘
         │ HTTP/REST API
         │ (JSON, File Upload)
         ▼
┌─────────────────┐
│  NestJS Backend │
│   Port: 4000    │
│  /api/documents │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│Prisma  │ │ File Storage │
│ ORM    │ │ /uploads/    │
└───┬────┘ └──────────────┘
    │
    ▼
┌─────────────┐
│ PostgreSQL  │
│  Port: 5432 │
└─────────────┘
```

## Data Flow

### Upload Flow

1. **User selects PDF file** in the frontend
2. **Client-side validation**:
   - File type check (PDF only)
   - File size check (max 10MB)
3. **Frontend sends FormData** to `POST /api/documents/upload`
4. **Backend receives file** via Multer middleware
5. **Server-side validation**:
   - MIME type validation
   - File size validation
6. **Generate unique filename** (UUID + .pdf extension)
7. **Save file to disk** in `backend/uploads/` directory
8. **Save metadata to database** via Prisma:
   - Original filename
   - Stored filename
   - Filepath
   - Filesize
   - Timestamp
9. **Return document metadata** as JSON response
10. **Frontend updates UI**:
    - Show success notification
    - Refresh document list

### Download Flow

1. **User clicks download button** for a document
2. **Frontend calls** `GET /api/documents/:id`
3. **Backend queries database** for document metadata
4. **Verify file exists** on disk
5. **Read file from filesystem**
6. **Return file as download** with proper headers:
   - `Content-Type: application/pdf`
   - `Content-Disposition: attachment; filename="original.pdf"`
7. **Frontend creates blob URL** and triggers download
8. **Browser downloads file** to user's Downloads folder

### List Documents Flow

1. **User loads page** or refreshes document list
2. **Frontend calls** `GET /api/documents`
3. **Backend queries database** via Prisma:
   - Select all documents
   - Order by `createdAt DESC`
4. **Return array of document metadata** as JSON
5. **Frontend renders list**:
   - Display original filename
   - Show formatted file size
   - Show formatted date
   - Render download/delete buttons

### Delete Flow

1. **User clicks delete button** and confirms deletion
2. **Frontend calls** `DELETE /api/documents/:id`
3. **Backend queries database** for document
4. **Delete file from filesystem** using stored filepath
5. **Delete record from database** via Prisma
6. **Return 204 No Content**
7. **Frontend shows success notification**
8. **Frontend refreshes document list**

## API Specification

### Base URL

```
http://localhost:4000/api/documents
```

### Endpoints

#### POST /upload

Upload a PDF document.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with field `file` containing PDF file

**Validation:**
- File type must be `application/pdf`
- File size must be ≤ 10MB (10,485,760 bytes)

**Response (Success - 200 OK):**
```json
{
  "id": 1,
  "originalFilename": "medical-report.pdf",
  "storedFilename": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
  "filepath": "./uploads/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
  "filesize": 524288,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Only PDF files are allowed",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/documents/upload"
}
```

#### GET /

List all uploaded documents.

**Request:**
- Method: `GET`
- No parameters required

**Response (Success - 200 OK):**
```json
[
  {
    "id": 2,
    "originalFilename": "lab-results.pdf",
    "storedFilename": "b2c3d4e5-f6g7-8901-bcde-f12345678901.pdf",
    "filepath": "./uploads/b2c3d4e5-f6g7-8901-bcde-f12345678901.pdf",
    "filesize": 1048576,
    "createdAt": "2024-01-15T11:00:00.000Z"
  },
  {
    "id": 1,
    "originalFilename": "medical-report.pdf",
    "storedFilename": "a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
    "filepath": "./uploads/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf",
    "filesize": 524288,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

*Note: Documents are ordered by `createdAt DESC` (newest first)*

#### GET /:id

Download a specific document.

**Request:**
- Method: `GET`
- Path Parameter: `id` (integer)

**Response (Success - 200 OK):**
- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="original-filename.pdf"`
- Body: PDF file binary data

**Response (Error - 404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Document with ID 999 not found",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "path": "/api/documents/999"
}
```

#### DELETE /:id

Delete a document.

**Request:**
- Method: `DELETE`
- Path Parameter: `id` (integer)

**Response (Success - 204 No Content):**
- No response body

**Response (Error - 404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Document with ID 999 not found",
  "timestamp": "2024-01-15T12:00:00.000Z",
  "path": "/api/documents/999"
}
```

## Database Schema

### Document Model

```prisma
model Document {
  id              Int      @id @default(autoincrement())
  originalFilename String   // Original filename from upload
  storedFilename   String   // UUID-based filename on disk
  filepath         String   // Full path to file on disk
  filesize         Int      // File size in bytes
  createdAt        DateTime @default(now()) // Upload timestamp
}
```

**Fields:**
- `id`: Auto-incrementing primary key
- `originalFilename`: Original filename provided by user (e.g., "medical-report.pdf")
- `storedFilename`: UUID-based filename stored on disk (e.g., "a1b2c3d4-...pdf")
- `filepath`: Absolute or relative path to file (e.g., "./uploads/a1b2c3d4-...pdf")
- `filesize`: File size in bytes
- `createdAt`: Timestamp when document was uploaded

**Indexes:**
- Primary key on `id` (automatic)
- Consider adding index on `createdAt` for faster ordering in large datasets

## Assumptions

### Security Assumptions
1. **Single User**: No authentication/authorization implemented. Assumes single-user environment.
2. **Trusted Environment**: Assumes backend runs in trusted network. No rate limiting or IP restrictions.
3. **File Validation**: Only client and server-side validation. No virus scanning or deep file inspection.

### Functional Assumptions
1. **PDF Only**: Only PDF files are accepted. Other document types are rejected.
2. **File Size Limit**: Maximum 10MB per file. Larger files are rejected.
3. **Local Storage**: Files stored on local filesystem. Not suitable for distributed deployments.
4. **No Versioning**: Deleting a document permanently removes it. No recovery or version history.
5. **No Metadata**: No additional metadata like tags, categories, or descriptions.
6. **Single Directory**: All files stored in flat directory structure (no subdirectories).

### Technical Assumptions
1. **Development Environment**: Designed for development/local use. Production deployment requires additional configuration.
2. **Synchronous Operations**: File operations are synchronous. Large files may block requests.
3. **No Caching**: No caching layer. Every request hits database and filesystem.
4. **Error Handling**: Basic error handling. Production needs more robust error recovery.

### Operational Assumptions
1. **Manual Backups**: No automatic backup system. Requires manual database and file backups.
2. **Single Server**: Not designed for horizontal scaling. Single backend instance.
3. **No Monitoring**: No logging aggregation or monitoring tools integrated.

## Scaling Plan for 1,000 Users

### Current Limitations

The current architecture will face bottlenecks with 1,000 concurrent users:

1. **File Storage**: Local filesystem cannot be shared across multiple servers
2. **Database**: Single PostgreSQL instance may become a bottleneck
3. **Backend**: Single NestJS instance cannot handle 1,000 concurrent requests
4. **No Caching**: Every request hits database and filesystem
5. **No CDN**: Files served directly from backend, increasing load

### Scaling Strategy

#### 1. File Storage Migration to S3

**Current**: Local filesystem (`backend/uploads/`)

**Scaled Solution**:
- **AWS S3** or equivalent cloud storage (Azure Blob Storage, Google Cloud Storage)
- Store files in S3 bucket with versioning enabled
- Update `filepath` in database to S3 object key
- Implement pre-signed URLs for secure, direct downloads

**Benefits**:
- Scalable storage (virtually unlimited)
- High availability and durability
- Can serve files directly via CDN
- Reduces backend server load

**Implementation**:
```typescript
// Example S3 integration
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Upload to S3
const s3Client = new S3Client({ region: 'us-east-1' });
await s3Client.send(new PutObjectCommand({
  Bucket: 'patient-portal-documents',
  Key: storedFilename,
  Body: file.buffer,
  ContentType: 'application/pdf',
}));
```

#### 2. Database Scaling (RDS)

**Current**: Single PostgreSQL instance

**Scaled Solution**:
- **AWS RDS PostgreSQL** with Multi-AZ deployment for high availability
- **Read Replicas**: Deploy read replicas for read-heavy operations (list documents)
- **Connection Pooling**: Use PgBouncer or RDS Proxy for connection management
- **Database Indexing**: Add indexes on frequently queried fields (`createdAt`, `originalFilename`)

**Benefits**:
- High availability (automatic failover)
- Better performance with read replicas
- Managed backups and maintenance
- Vertical and horizontal scaling options

**Schema Enhancements** (future):
```prisma
model Document {
  id              Int      @id @default(autoincrement())
  originalFilename String
  storedFilename   String   @unique  // Add unique constraint
  s3Key           String?  // S3 object key (for cloud storage)
  filepath        String   // Local filepath or deprecated if using S3
  filesize        Int
  createdAt       DateTime @default(now()) @index  // Add index
  
  @@index([createdAt])
  @@index([originalFilename])
}
```

#### 3. Backend Load Balancing

**Current**: Single NestJS instance

**Scaled Solution**:
- **Multiple Backend Instances**: Deploy 3-5 NestJS instances
- **Load Balancer**: AWS Application Load Balancer (ALB) or Nginx
- **Session Sticky**: Not needed (stateless API)
- **Health Checks**: Configure health check endpoints

**Architecture**:
```
                    ┌──────────────┐
                    │ Load Balancer│
                    │    (ALB)     │
                    └──────┬───────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼────┐      ┌──────▼─────┐      ┌────▼────┐
   │ Backend │      │  Backend   │      │ Backend │
   │  App 1  │      │   App 2    │      │  App 3  │
   └────┬────┘      └──────┬─────┘      └────┬────┘
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │   RDS (DB)  │
                    └─────────────┘
```

#### 4. CDN for File Delivery

**Current**: Files served directly from backend

**Scaled Solution**:
- **CloudFront (AWS)** or equivalent CDN
- Configure CDN to serve files from S3 bucket
- Cache PDFs at edge locations
- Use pre-signed URLs for private documents

**Benefits**:
- Reduced latency (files served from nearest edge location)
- Reduced backend load (files not served through backend)
- Better global performance
- Lower bandwidth costs

**Implementation**:
- Upload files to S3
- Configure CloudFront distribution pointing to S3
- Generate CloudFront pre-signed URLs for downloads
- Update download endpoint to redirect to CDN URL

#### 5. Caching Layer

**Current**: Every request hits database

**Scaled Solution**:
- **Redis Cache** for document metadata
- Cache document list for 1-5 minutes
- Invalidate cache on upload/delete operations
- Use Redis for rate limiting and session storage (if adding auth)

**Implementation**:
```typescript
// Example Redis caching
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache document list
async function getCachedDocuments() {
  const cached = await redis.get('documents:list');
  if (cached) return JSON.parse(cached);
  
  const documents = await prisma.document.findMany({...});
  await redis.setex('documents:list', 300, JSON.stringify(documents));
  return documents;
}
```

#### 6. Rate Limiting

**Current**: No rate limiting

**Scaled Solution**:
- Implement rate limiting using Redis
- Limit uploads: 10 per minute per IP
- Limit downloads: 100 per minute per IP
- Use `@nestjs/throttler` package

#### 7. Monitoring and Logging

**Scaled Solution**:
- **CloudWatch (AWS)** or Datadog for metrics and logs
- Track: request rate, error rate, file upload size, database query performance
- Set up alerts for errors, high latency, disk space
- Log aggregation using ELK stack or CloudWatch Logs

#### 8. Additional Enhancements

**Queue System**:
- Use **AWS SQS** or Bull (Redis-based) for async file processing
- Queue upload operations to handle spikes
- Process file validation, thumbnail generation, etc. asynchronously

**Database Optimization**:
- Implement pagination for document list (limit 50 per page)
- Add full-text search using PostgreSQL's `tsvector` or Elasticsearch
- Archive old documents to cold storage (S3 Glacier)

**Security Enhancements**:
- Implement authentication (JWT tokens)
- Add user-based access control
- Encrypt files at rest in S3
- Implement virus scanning (ClamAV, AWS GuardDuty)

### Estimated Costs (AWS)

For 1,000 active users:

- **EC2 (Backend)**: 3x t3.medium instances = ~$100/month
- **RDS PostgreSQL**: db.t3.medium Multi-AZ = ~$150/month
- **S3 Storage**: 1TB storage = ~$23/month
- **CloudFront**: 100GB transfer = ~$10/month
- **ELB**: Application Load Balancer = ~$20/month
- **Redis Cache**: ElastiCache cache.t3.medium = ~$50/month

**Total**: ~$350-400/month

### Migration Path

1. **Phase 1**: Move files to S3, update backend to use S3 SDK
2. **Phase 2**: Deploy to RDS, migrate database
3. **Phase 3**: Add load balancer, deploy multiple backend instances
4. **Phase 4**: Configure CDN, update download URLs
5. **Phase 5**: Add Redis cache, implement rate limiting
6. **Phase 6**: Add monitoring, alerting, and logging

## Conclusion

The current architecture is suitable for single-user or small-scale deployments. For 1,000 users, migrating to cloud services (S3, RDS, CDN) and implementing horizontal scaling (load balancing, caching) is essential for performance and reliability.

