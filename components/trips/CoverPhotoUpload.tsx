'use client'

import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface CoverPhotoUploadProps {
  tripId: string
  currentUrl: string | null
  onUpload: (url: string) => void
}

export function CoverPhotoUpload({ tripId, currentUrl, onUpload }: CoverPhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const ext = file.name.split('.').pop()
      const path = `${user.id}/${tripId}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('trip-covers')
        .upload(path, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('trip-covers').getPublicUrl(path)
      const publicUrl = data.publicUrl

      setPreview(publicUrl)
      onUpload(publicUrl)
      toast.success('Cover photo updated')
    } catch (err: any) {
      toast.error(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div>
      {preview ? (
        <div className="relative overflow-hidden rounded-[5px] border border-[#DAD2BC]">
          <img src={preview} alt="Trip cover" className="h-48 w-full object-cover" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-3 right-3 rounded-[5px] bg-white/90 px-3 py-1.5 text-xs font-medium text-[#252323] shadow-sm transition-colors hover:bg-white"
          >
            {uploading ? 'Uploading...' : 'Change photo'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-[5px] border-2 border-dashed border-[#DAD2BC] text-[#A99985] transition-colors hover:border-[#70798C] hover:text-[#70798C]"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <span className="text-sm">{uploading ? 'Uploading...' : 'Add a cover photo'}</span>
          <span className="text-xs text-[#DAD2BC]">JPG, PNG, WebP — max 5MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
