import { CompanySchema } from "../../schemas"
import { updateCompanyDetails } from "./server"
import { createServerFn } from "@tanstack/react-start"

export const updateCompanyDetailsFn = createServerFn()
  .inputValidator(CompanySchema)
  .handler(({ data }) => updateCompanyDetails(data))
