// Get API URL from environment variable
// NEXT_PUBLIC_ prefix is required for Next.js to expose env vars to browser
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// Debug: Log API URL in development (remove in production)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('🔗 API URL:', API_URL)
}

export interface Document {
  id: number
  originalFilename: string
  storedFilename: string
  filepath: string
  filesize: number
  createdAt: string
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'An error occurred' }))
    throw new ApiError(response.status, errorData.message || `HTTP error! status: ${response.status}`)
  }

  // For 204 No Content responses
  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData()
  formData.append('file', file)

  const url = `${API_URL}/api/documents/upload`
  console.log('📤 Upload URL:', url)

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header for FormData - browser sets it automatically with boundary
  })

  return handleResponse<Document>(response)
}

export async function getDocuments(): Promise<Document[]> {
  const url = `${API_URL}/api/documents`
  console.log('📥 GET URL:', url)

  const response = await fetch(url)
  return handleResponse<Document[]>(response)
}

export async function downloadDocument(id: number, filename: string): Promise<void> {
  const url = `${API_URL}/api/documents/${id}`
  console.log('⬇️ Download URL:', url)

  const response = await fetch(url)
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Download failed' }))
    throw new ApiError(response.status, errorData.message || 'Failed to download document')
  }

  const blob = await response.blob()
  const blobUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(blobUrl)
  document.body.removeChild(a)
}

export async function deleteDocument(id: number): Promise<void> {
  const url = `${API_URL}/api/documents/${id}`
  console.log('🗑️ Delete URL:', url)

  const response = await fetch(url, {
    method: 'DELETE',
  })

  return handleResponse<void>(response)
}

