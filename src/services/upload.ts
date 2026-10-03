import axios from 'axios'
import http from '@/lib/http'

type ProgressCallback = (percent: number) => void

// Presign flow: POST to get a signed URL, then PUT directly to storage
export async function presignUpload(file: File, onProgress?: ProgressCallback): Promise<string> {
  const { data: body } = await http.post('/upload/presign', {
    filename: file.name,
    contentType: file.type,
  })

  const payload   = body?.data ?? body
  const uploadUrl = payload.uploadUrl ?? payload.upload_url
  const key       = payload.key

  if (!uploadUrl) throw new Error('No uploadUrl in presign response')

  // PUT goes directly to storage (S3/R2), so use plain axios — no auth header needed
  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100))
    },
  })

  return key ?? uploadUrl.split('?')[0]
}

// Multipart flow: POST the file directly to our own API
export async function multipartUpload(file: File, onProgress?: ProgressCallback): Promise<string> {
  const form = new FormData()
  form.append('file', file)

  const { data } = await http.post('/upload', form, {
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100))
    },
  })

  return data?.url ?? data
}
