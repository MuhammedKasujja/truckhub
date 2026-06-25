import { useState } from "react"
import { Viewer, Worker } from "@react-pdf-viewer/core"
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout"

// Import styles
import "@react-pdf-viewer/core/lib/styles/index.css"
import "@react-pdf-viewer/default-layout/lib/styles/index.css"
import { useTheme } from "./theme/provider"
import { Card, CardContent, CardHeader } from "./ui/card"
import { Skeleton } from "./ui/skeleton"

export function PdfViewer({ pdfUrl }: { pdfUrl: string | Uint8Array }) {
  const [fileUrl] = useState(pdfUrl)
  const defaultLayoutPluginInstance = defaultLayoutPlugin()
  const theme = useTheme()
  return (
    <div
      style={{
        height: "800px",
        width: "100%",
        border: "1px solid var(--border)",
        marginTop: 16,
      }}
    >
      <Worker workerUrl="/pdf.worker.min.mjs">
        <Viewer
          fileUrl={fileUrl}
          // plugins={[defaultLayoutPluginInstance]}
          theme={theme}
          defaultScale={1} // 1 = 100%
        />
      </Worker>
    </div>
  )
}

export function SkeletonPdfViewer() {
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

// import { useState } from "react"
// import { Document, Page, pdfjs } from "react-pdf"
// import "react-pdf/dist/Page/AnnotationLayer.css"
// import "react-pdf/dist/Page/TextLayer.css"

// // Configure worker (Vite / Create React App / Next.js)
// pdfjs.GlobalWorkerOptions.workerSrc = new URL(
//   "/pdf.worker.min.mjs",
//   import.meta.url
// ).toString()

// export function PdfViewer({ pdfUrl }: { pdfUrl: string }) {
//   const [numPages, setNumPages] = useState<number | null>(null)
//   const [pageNumber, setPageNumber] = useState(1)

//   function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
//     setNumPages(numPages)
//   }

//   return (
//     <div>
//       <Document
//         file={pdfUrl} // Can be URL, base64, or Uint8Array
//         onLoadSuccess={onDocumentLoadSuccess}
//         loading={<div>Loading PDF...</div>}
//         error={<div>Failed to load PDF</div>}
//       >
//         <Page
//           pageNumber={pageNumber}
//           width={800}
//           renderTextLayer={true}
//           renderAnnotationLayer={true}
//         />
//       </Document>

//       <div style={{ marginTop: "10px" }}>
//         <button
//           disabled={pageNumber <= 1}
//           onClick={() => setPageNumber((p) => p - 1)}
//         >
//           Previous
//         </button>
//         <span>
//           {" "}
//           Page {pageNumber} of {numPages}{" "}
//         </span>
//         <button
//           disabled={pageNumber >= (numPages || 1)}
//           onClick={() => setPageNumber((p) => p + 1)}
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   )
// }
