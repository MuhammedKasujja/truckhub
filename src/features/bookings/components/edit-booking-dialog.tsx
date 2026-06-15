import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BookingRequestForm } from "./booking-request-form"

export function EditBookingDialog() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent className="left-10%] top-[10%] right-[10%] bottom-[10%] h-auto max-h-none w-auto max-w-none translate-x-0 translate-y-0 overflow-auto sm:max-w-none">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>
        <BookingRequestForm/>
      </DialogContent>
    </Dialog>
  )
}
