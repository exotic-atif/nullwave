export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

/**
 * Compress the blob repeatedly until it is under the target size.
 */
async function compressToTargetSize(
  canvas: HTMLCanvasElement,
  targetSizeKB: number = 100,
  minQuality: number = 0.5
): Promise<File> {
  let quality = 0.95
  const maxBytes = targetSizeKB * 1024

  return new Promise((resolve, reject) => {
    const attemptCompression = () => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'))
            return
          }
          if (blob.size <= maxBytes || quality <= minQuality) {
            const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
            resolve(file)
          } else {
            quality -= 0.1
            attemptCompression()
          }
        },
        'image/jpeg',
        quality
      )
    }
    attemptCompression()
  })
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  targetSize: number = 512
): Promise<File> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  // Target size (512x512)
  canvas.width = targetSize
  canvas.height = targetSize

  // Draw the cropped image directly onto the 512x512 canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    targetSize,
    targetSize
  )

  // Compress until ~100KB
  return await compressToTargetSize(canvas, 100)
}
