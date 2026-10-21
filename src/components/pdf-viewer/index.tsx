import { lazy, Suspense } from "react"
import { ClientOnly } from "@tanstack/react-router"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const PdfViewLoader = lazy(() => import("./pdf-view-loader"))

export function PdfViewer({ pdfUrl }: { pdfUrl: string | Uint8Array | null| undefined }) {
  if (!pdfUrl) return <SkeletonPdfViewer />

  return (
    <ClientOnly fallback={<SkeletonPdfViewer />}>
      <Suspense fallback={<SkeletonPdfViewer />}>
        <PdfViewLoader pdfUrl={pdfUrl} />
      </Suspense>
    </ClientOnly>
  )
}

function SkeletonPdfViewer() {
  return (
    <div className="flex min-h-200 w-full items-center justify-center border">
      <Card className="min-h-190 w-[80%] rounded-none">
        <CardHeader>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}
