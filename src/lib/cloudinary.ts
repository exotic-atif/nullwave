// ===== CLOUDINARY UPLOAD HELPER =====

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'mian-storage'
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || ''
const WORKER_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

/**
 * Upload an image to Cloudinary with signed upload.
 * Uses the NullWave worker's /sign-upload endpoint.
 */
export async function uploadToCloudinary(
  file: File,
  options: {
    folder: string
    public_id: string
    overwrite?: boolean
  }
): Promise<string> {
  if (!API_KEY) {
    throw new Error('Missing VITE_CLOUDINARY_API_KEY in .env')
  }

  const { folder, public_id, overwrite = true } = options

  // 1. Get signature from backend
  const signBody: Record<string, string> = { folder, public_id }
  if (overwrite) {
    signBody.overwrite = 'true'
    signBody.invalidate = 'true'
  }

  const signRes = await fetch(`${WORKER_URL}/sign-upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(signBody),
  })

  if (!signRes.ok) throw new Error('Failed to get upload signature')
  const { signature, timestamp } = await signRes.json()

  // 2. Upload to Cloudinary
  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', API_KEY)
  formData.append('timestamp', timestamp)
  formData.append('signature', signature)
  formData.append('folder', folder)
  formData.append('public_id', public_id)
  if (overwrite) {
    formData.append('overwrite', 'true')
    formData.append('invalidate', 'true')
  }

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  )

  if (!uploadRes.ok) throw new Error('Failed to upload image')
  const data = await uploadRes.json()

  return data.secure_url as string
}
