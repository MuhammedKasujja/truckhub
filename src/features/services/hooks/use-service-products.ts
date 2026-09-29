import { useQuery } from "@tanstack/react-query";
import { serviceQueryOptions } from "../query-options";

export function useServiceProducts() {
    return useQuery(serviceQueryOptions())
}