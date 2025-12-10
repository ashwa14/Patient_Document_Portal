'use client'

import { useState, useEffect } from 'react'
import { uploadDocument, getDocuments, deleteDocument, downloadDocument } from '@/lib/api'
import { toast } from 'react-toastify'

interface Document {
  id: number
  originalFilename: string
  storedFilename: string
  filepath: string
  filesize: number
  createdAt: string
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB in bytes

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const data = await getDocuments()
      setDocuments(data)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const validateAndSetFile = (selectedFile: File | null) => {
    if (!selectedFile) {
      setFile(null)
      return false
    }

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed')
      setFile(null)
      return false
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error(`File size exceeds maximum allowed size of ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`)
      setFile(null)
      return false
    }

    setFile(selectedFile)
    return true
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    validateAndSetFile(selectedFile || null)
    if (e.target) {
      e.target.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      toast.error('Please select a file to upload')
      return
    }

    setUploading(true)
    try {
      await uploadDocument(file)
      toast.success('Document uploaded successfully!')
      setFile(null)
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
      // Reload documents
      await loadDocuments()
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (id: number, filename: string) => {
    try {
      await downloadDocument(id, filename)
      toast.success('Download started')
    } catch (error: any) {
      toast.error(error.message || 'Failed to download document')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      await deleteDocument(id)
      toast.success('Document deleted successfully!')
      await loadDocuments()
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete document')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <main className="container">
      <div className="header">
        <h1>Patient Document Portal</h1>
        <p>Upload, view, and manage your PDF documents</p>
      </div>

      <div className="upload-section">
        <h2>Upload Document</h2>
        <form onSubmit={handleUpload} className="upload-form">
          <div className="file-input-wrapper">
            <div
              className={`file-drop-zone ${isDragging ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="file-input"
              />
              <label htmlFor="file-input" className="file-input-label">
                Choose PDF File
              </label>
              <p style={{ marginTop: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                or drag and drop your PDF here
              </p>
            </div>
            {file && <div className="file-name">{file.name}</div>}
          </div>
          <div className="file-size-limit">
            Maximum file size: {MAX_FILE_SIZE / 1024 / 1024}MB
          </div>
          <button
            type="submit"
            className="upload-button"
            disabled={!file || uploading}
          >
            {uploading ? '⏳ Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>

      <div className="documents-section">
        <h2>Your Documents</h2>
        {loading ? (
          <div className="loading">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading documents...</div>
          </div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <p>No documents uploaded yet.</p>
            <p>Upload your first PDF document above.</p>
          </div>
        ) : (
          <div className="documents-list">
            {documents.map((doc) => (
              <div key={doc.id} className="document-item">
                <div className="document-info">
                  <div className="document-name">{doc.originalFilename}</div>
                  <div className="document-meta">
                    <span>📊 {formatFileSize(doc.filesize)}</span>
                    <span>🕒 {formatDate(doc.createdAt)}</span>
                  </div>
                </div>
                <div className="document-actions">
                  <button
                    className="btn btn-download"
                    onClick={() => handleDownload(doc.id, doc.originalFilename)}
                  >
                    Download
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(doc.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

