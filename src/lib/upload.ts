import { createClient } from '@supabase/supabase-js'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const BUCKET_NAME = 'product-images'

/**
 * Creates a Supabase client using the service role key.
 * MUST only be called server-side. Never expose the service role key to the client.
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Uploads a file to Supabase Storage (production) or local /public/uploads (dev fallback).
 *
 * @param file - The File object to upload
 * @param productId - Optional product ID to organize storage path. If omitted, uses "temp" folder.
 * @returns { success, url?, error? }
 */
export async function saveUploadedFile(
  file: File,
  productId?: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  // --- Validation ---
  if (!file || file.size === 0) {
    return { success: false, error: 'Fichier invalide ou vide.' }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: 'La taille de l image ne doit pas dépasser 5 Mo.' }
  }

  // Validate MIME type (do not trust extension alone)
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return { success: false, error: 'Format d image non autorisé (JPG, PNG, WEBP, GIF seulement).' }
  }

  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return { success: false, error: 'Extension de fichier non autorisée.' }
  }

  // --- Build a unique, safe filename ---
  const uniqueName = `${Date.now()}-${crypto.randomUUID().substring(0, 8)}${extension}`
  const folder = productId ? `products/${productId}` : `products/temp`
  const storagePath = `${folder}/${uniqueName}`

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // --- Try Supabase Storage ---
  const supabase = getSupabaseClient()

  if (supabase) {
    try {
      const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        })

      if (error) {
        console.error('Erreur upload Supabase Storage:', error.message)
        return { success: false, error: 'Erreur lors de l envoi de l image vers le stockage.' }
      }

      const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath)
      return { success: true, url: data.publicUrl }
    } catch (err) {
      console.error('Erreur upload Supabase Storage:', err)
      return { success: false, error: 'Erreur lors de l envoi de l image vers le stockage.' }
    }
  }

  // --- Production without Supabase → explicit error ---
  if (process.env.NODE_ENV === 'production') {
    return {
      success: false,
      error:
        'Stockage non configuré. Veuillez définir NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans les variables d environnement Vercel.',
    }
  }

  // --- Dev fallback: local filesystem (/public/uploads) ---
  try {
    const { writeFile, mkdir } = await import('fs/promises')
    const { existsSync } = await import('fs')
    const path = await import('path')

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = path.join(uploadDir, uniqueName)
    await writeFile(filePath, buffer)

    return { success: true, url: `/uploads/${uniqueName}` }
  } catch (err) {
    console.error('Erreur upload local (dev):', err)
    return { success: false, error: 'Erreur lors de la sauvegarde locale du fichier.' }
  }
}

/**
 * Deletes a file from Supabase Storage or local /public/uploads (dev fallback).
 *
 * Supports Supabase public URLs of the form:
 *   https://PROJECT.supabase.co/storage/v1/object/public/product-images/products/...
 *
 * @param relativeOrFullUrl - The URL stored in ProductImage.url
 */
export async function deleteUploadedFile(relativeOrFullUrl: string): Promise<void> {
  try {
    if (!relativeOrFullUrl) return

    // --- Supabase Storage delete ---
    if (relativeOrFullUrl.includes('/storage/v1/object/public/')) {
      const supabase = getSupabaseClient()
      if (!supabase) {
        console.warn('Supabase non configuré — impossible de supprimer l image distante.')
        return
      }

      // Extract the storage path after the bucket name
      // URL: https://PROJECT.supabase.co/storage/v1/object/public/product-images/products/xxx.jpg
      const marker = `/storage/v1/object/public/${BUCKET_NAME}/`
      const markerIndex = relativeOrFullUrl.indexOf(marker)

      if (markerIndex !== -1) {
        const storagePath = relativeOrFullUrl.substring(markerIndex + marker.length)
        const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath])
        if (error) {
          console.error('Erreur suppression Supabase Storage:', error.message)
        }
      }
      return
    }

    // --- Local dev fallback: delete from /public/uploads ---
    if (relativeOrFullUrl.startsWith('/uploads/')) {
      const { unlink } = await import('fs/promises')
      const { existsSync } = await import('fs')
      const path = await import('path')

      const fileName = path.basename(relativeOrFullUrl)
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName)
      if (existsSync(filePath)) {
        await unlink(filePath)
      }
    }
  } catch (err) {
    console.error('Erreur lors de la suppression du fichier:', err)
  }
}
