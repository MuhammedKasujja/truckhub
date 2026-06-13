import { Link, useLocation, useRouter } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Field } from "./ui/field"

export function NotFound({}: { children?: React.ReactNode }) {
  const location = useLocation();
  const router = useRouter()
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 p-6">
      <h1>Page not Found</h1>
      <p className="text-5xl font-bold">404</p>
      {location.href}
      <Field orientation={"horizontal"} className="items-center justify-center">
        <Button onClick={() => router.history.back()}>Go Back</Button>
        <Button variant={"outline"} asChild>
          <Link to="/">Start Over</Link>
        </Button>
      </Field>
    </div>
  )
}
