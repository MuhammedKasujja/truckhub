import { toast } from "sonner"

export function useCopyToClipboard() {
  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast.info("Copied!")
    } catch (err) {
      toast.error("Failed to copy")
    }
  }

  return { copyToClipboard }
}
