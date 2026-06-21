import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Camera, Upload, Loader2, ZoomIn, ZoomOut, User } from 'lucide-react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '@/lib/cropImage'

interface ProfilePictureModalProps {
  isOpen: boolean
  onClose: () => void
  currentAvatar: string | null
  onUpload: (file: File) => Promise<void>
  onDelete: () => Promise<void>
}

export function ProfilePictureModal({
  isOpen,
  onClose,
  currentAvatar,
  onUpload,
  onDelete,
}: ProfilePictureModalProps) {
  const [mode, setMode] = useState<'view' | 'crop'>('view')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  
  // Cropper state
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      alert('Image is too large. Please select an image under 10MB.')
      return
    }

    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setImageSrc(reader.result?.toString() || null)
      setMode('crop')
    })
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setIsProcessing(true)
    try {
      const croppedImageFile = await getCroppedImg(imageSrc, croppedAreaPixels, 512)
      await onUpload(croppedImageFile)
      handleClose()
    } catch (err) {
      console.error(err)
      alert('Failed to crop image')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setMode('view')
    setImageSrc(null)
    setZoom(1)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-nw-elevated/90 border border-white/10 shadow-2xl rounded-3xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            <h2 className="text-xl font-display font-bold text-nw-text">
              {mode === 'view' ? 'Profile Picture' : 'Adjust Picture'}
            </h2>
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-nw-text-secondary hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            {mode === 'view' ? (
              <div className="flex flex-col items-center gap-8">
                {/* Current Avatar View */}
                <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-nw-surface bg-nw-surface/50 shadow-2xl shadow-black/50">
                  {currentAvatar ? (
                    <img src={currentAvatar} alt="Current DP" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={80} className="text-nw-text-tertiary" />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 w-full">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-nw-text text-nw-black hover:bg-white font-semibold rounded-xl transition-colors shadow-lg shadow-white/5"
                  >
                    <Camera size={18} />
                    Change Picture
                  </button>
                  {currentAvatar && (
                    <button
                      onClick={async () => {
                        await onDelete()
                        handleClose()
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 font-semibold rounded-xl transition-colors border border-red-500/20"
                    >
                      <Trash2 size={18} />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Cropper Workspace */}
                <div className="relative w-full h-[400px] bg-black/50 rounded-2xl overflow-hidden border border-white/5">
                  <Cropper
                    image={imageSrc || ''}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-4 px-2">
                  <ZoomOut size={20} className="text-nw-text-secondary" />
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-label="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-nw-text [&::-webkit-slider-thumb]:rounded-full"
                  />
                  <ZoomIn size={20} className="text-nw-text-secondary" />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSave}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-nw-text text-nw-black hover:bg-white disabled:opacity-50 font-semibold rounded-xl transition-colors shadow-lg shadow-white/5"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Save Picture
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
