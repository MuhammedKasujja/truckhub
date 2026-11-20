type Options = { maxSide?: number; quality?: number }

const COMPRESSIBLE = /^image\/(jpeg|png|webp|heic|heif)$/i

/**
 * Shrinks a phone photo before it is sent. Anything that is not a photo, or
 * that the browser cannot decode (some HEIC files), is returned unchanged.
 */
export async function compressImage(
  file: File,
  { maxSide = 2000, quality = 0.85 }: Options = {}
): Promise<File> {
  if (!COMPRESSIBLE.test(file.type)) return file

  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    })
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext("2d")
    if (!context) return file
    context.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    )
    if (!blob || blob.size >= file.size) return file

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg"
    return new File([blob], name, {
      type: "image/jpeg",
      lastModified: Date.now(),
    })
  } catch {
    return file
  }
}
