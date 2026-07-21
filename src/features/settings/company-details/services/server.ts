import { Company } from "../../schemas"
import * as apiClient from "@/lib/api-client"

const endpoint = "/v1/companies"

export function updateCompanyDetails(company: Company) {
  return apiClient.putFn<Company>(endpoint, company)
}
