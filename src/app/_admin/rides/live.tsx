import { Button } from "@/components/ui/button"
import {
  FloatingPanel,
  FloatingPanelBody,
  FloatingPanelCloseTrigger,
  FloatingPanelContent,
  FloatingPanelControl,
  FloatingPanelHeader,
  FloatingPanelMaximize,
  FloatingPanelMinimize,
  FloatingPanelRestore,
  FloatingPanelTitle,
  FloatingPanelTrigger,
} from "@/components/ui/floating-panel"
import { LiveRideMap } from "@/features/ride-requests/components"
import { createFileRoute } from "@tanstack/react-router"
import { Settings2Icon, XIcon } from "lucide-react"
import { useState } from "react"

export const Route = createFileRoute("/_admin/rides/live")({
  component: RouteComponent,
})

function RouteComponent() {
  const [size, setSize] = useState({ width: 360, height: 200 });
  return (
    <>
      <FloatingPanel
        onSizeChange={(details) => setSize(details.size)}
        size={size}
      >
        <FloatingPanelTrigger asChild>
          <Button variant="outline">Open Settings Panel</Button>
        </FloatingPanelTrigger>
        <FloatingPanelContent>
          <FloatingPanelHeader>
            <Settings2Icon />
            <FloatingPanelTitle>Settings</FloatingPanelTitle>
            <FloatingPanelControl>
              <FloatingPanelMinimize />
              <FloatingPanelMaximize />
              <FloatingPanelRestore />
              <FloatingPanelCloseTrigger asChild>
                <Button aria-label="Close" size="icon-sm">
                  <XIcon aria-hidden />
                </Button>
              </FloatingPanelCloseTrigger>
            </FloatingPanelControl>
          </FloatingPanelHeader>
          <FloatingPanelBody className="text-center text-sm text-muted-foreground">
            <p>
              Size: {size.width} × {size.height}.
            </p>
            <p>Use the buttons above or drag the edges to resize.</p>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() =>
                  setSize((prev) => ({
                    ...prev,
                    width: prev.width - 50,
                    height: prev.height - 40,
                  }))
                }
                variant="outline"
              >
                Shrink
              </Button>
              <Button
                className="flex-1"
                onClick={() =>
                  setSize((prev) => ({
                    ...prev,
                    width: prev.width + 50,
                    height: prev.height + 40,
                  }))
                }
                variant="outline"
              >
                Grow
              </Button>
            </div>
          </FloatingPanelBody>
        </FloatingPanelContent>
      </FloatingPanel>
      <LiveRideMap />
    </>
  )
}
