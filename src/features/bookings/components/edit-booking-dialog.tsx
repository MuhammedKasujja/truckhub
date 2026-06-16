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
        <Button type="button">Open</Button>
      </DialogTrigger>
      <DialogContent className="md:min-w-[80vw] min-h-[90vh] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Booking</DialogTitle>
        </DialogHeader>
        {/* <BookingRequestForm/> */}
      </DialogContent>
    </Dialog>
  )
}
