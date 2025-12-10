# Patient Document Portal

A full-stack application for uploading, viewing, downloading, and deleting PDF documents. Built with Next.js (App Router), NestJS, PostgreSQL, and Prisma.

## Project Overview

This is a single-user document management portal that allows you to:
- Upload PDF files (max 10MB)
- View all uploaded documents with metadata
- Download any document
- Delete documents

No authentication is required - this is designed for single-user use.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **File Storage**: Local filesystem (`backend/uploads/`)

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for PostgreSQL)
- Or a local PostgreSQL installation

## Setup Instructions

### 1. Clone and Navigate

```bash
cd "INI8 Labs Assignment"
```

### 2. Start PostgreSQL Database

Using Docker Compose (recommended):

```bash
docker-compose up -d
```

This will start PostgreSQL on port 5432 with:
- Username: `postgres`
- Password: `password`
- Database: `patient_portal`

**Alternative**: If you have PostgreSQL installed locally, create a database:

```sql
CREATE DATABASE patient_portal;
```

### 3. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/patient_portal
PORT=4000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_BYTES=10485760
CORS_ORIGIN=http://localhost:3000
```

Generate Prisma Client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Or manually:

```bash
npx prisma generate --schema=./prisma/schema.prisma
npx prisma migrate dev --schema=./prisma/schema.prisma
```

Create the uploads directory:

```bash
mkdir -p uploads
```

Start the backend server:

```bash
npm run start:dev
```

The backend will run on `http://localhost:4000`

### 4. Setup Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Start the frontend development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Project Structure

```
.
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── documents/      # Document module (controller, service, DTOs)
│   │   ├── prisma/         # Prisma service and module
│   │   ├── filters/        # Exception filters
│   │   ├── app.module.ts   # Root module
│   │   └── main.ts         # Application entry point
│   ├── uploads/            # Uploaded PDF files storage
│   ├── package.json
│   └── .env
├── frontend/               # Next.js frontend
│   ├── app/                # App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── lib/                # API client utilities
│   │   └── api.ts
│   ├── package.json
│   └── .env.local
├── backend/
│   ├── prisma/             # Prisma schema and migrations
│   │   ├── schema.prisma
│   │   └── migrations/
├── docker-compose.yml      # PostgreSQL container setup
├── design.md               # Architecture and design documentation
└── README.md               # This file
```

## API Endpoints

All endpoints are under the `/api/documents` prefix.

### Upload Document

```bash
POST /api/documents/upload
Content-Type: multipart/form-data

curl -X POST http://localhost:4000/api/documents/upload \
  -F "file=@/path/to/your/document.pdf"
```

**Response:**
```json
{
  "id": 1,
  "originalFilename": "document.pdf",
  "storedFilename": "uuid.pdf",
  "filepath": "./uploads/uuid.pdf",
  "filesize": 102400,
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

### List All Documents

```bash
GET /api/documents

curl http://localhost:4000/api/documents
```

**Response:**
```json
[
  {
    "id": 1,
    "originalFilename": "document.pdf",
    "storedFilename": "uuid.pdf",
    "filepath": "./uploads/uuid.pdf",
    "filesize": 102400,
    "createdAt": "2024-01-01T12:00:00.000Z"
  }
]
```

### Download Document

```bash
GET /api/documents/:id

curl -O http://localhost:4000/api/documents/1
```

Returns the PDF file as a download attachment.

### Delete Document

```bash
DELETE /api/documents/:id

curl -X DELETE http://localhost:4000/api/documents/1
```

**Response:** `204 No Content`

## Development Commands

### Backend

```bash
cd backend

# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio  # Opens Prisma Studio UI
```

### Frontend

```bash
cd frontend

# Development
npm run dev

# Production build
npm run build
npm run start

# Linting
npm run lint
```

## Troubleshooting

### Database Connection Issues

1. **Check if PostgreSQL is running:**
   ```bash
   docker-compose ps
   ```

2. **Verify DATABASE_URL in backend/.env:**
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/patient_portal
   ```

3. **Check if database exists:**
   ```bash
   docker exec -it patient_portal_db psql -U postgres -l
   ```

### Migration Issues

If migrations fail, you can reset the database:

```bash
cd backend
npx prisma migrate reset
```

**Warning**: This will delete all data!

### File Upload Issues

1. **Check uploads directory exists:**
   ```bash
   ls -la backend/uploads/
   ```

2. **Verify file permissions:**
   ```bash
   chmod 755 backend/uploads/
   ```

3. **Check MAX_FILE_SIZE_BYTES in backend/.env:**
   ```
   MAX_FILE_SIZE_BYTES=10485760  # 10MB
   ```

### CORS Issues

If you see CORS errors in the browser console:

1. Verify `CORS_ORIGIN` in `backend/.env` matches your frontend URL:
   ```
   CORS_ORIGIN=http://localhost:3000
   ```

2. Restart the backend server after changing `.env`

### Port Already in Use

If port 4000 or 3000 is already in use:

- **Backend**: Change `PORT=4000` in `backend/.env` to another port (e.g., `PORT=4001`)
- **Frontend**: Change port when starting: `npm run dev -- -p 3001`
- Update `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to match the new backend port

### Frontend Can't Connect to Backend

1. Verify backend is running: `curl http://localhost:4000/api/documents`

2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

3. Restart the frontend dev server after changing `.env.local`

## Production Deployment Considerations

- Move file storage to cloud storage (AWS S3, Azure Blob, etc.)
- Set up proper authentication and authorization
- Use environment-specific configuration
- Enable HTTPS
- Set up database backups
- Implement rate limiting
- Add request logging and monitoring
- Use a reverse proxy (Nginx) for production
- Set up CI/CD pipelines

See `design.md` for detailed scaling and architecture plans.

## License

MIT

