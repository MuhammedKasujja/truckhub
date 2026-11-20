import { CompanySchema } from "../../schemas"
import { updateCompanyDetails } from "./server"
import { createServerFn } from "@tanstack/react-start"

export const updateCompanyDetailsFn = createServerFn()
  .validator(CompanySchema)
  .handler(({ data }) => updateCompanyDetails(data))
