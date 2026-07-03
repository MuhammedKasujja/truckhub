import { EntityId } from "@/schemas"
import { UseFormSetValue, UseFormGetValues } from "react-hook-form"
import {
  RoutePricingStruct,
  TruckBookingRequest,
  TonnagePricingRequest,
} from "../../schemas"

export function useBookingFormActions(
  getValues: UseFormGetValues<TruckBookingRequest>,
  setValue: UseFormSetValue<TruckBookingRequest>
) {
  const reorderRoutes = ({
    serviceId,
    routes,
  }: {
    serviceId: string
    routes: RoutePricingStruct[]
  }) => {
    const services = getValues("services")

    const updated = services.map((service) => {
      if (service.tempId !== serviceId) return service

      return {
        ...service,
        routes,
      }
    })

    setValue("services", updated, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const reorderPricings = ({
    serviceId,
    routeId,
    pricings,
  }: {
    serviceId: EntityId
    routeId: EntityId
    pricings: TonnagePricingRequest[]
  }) => {
    const services = getValues("services")

    const updated = updateById(services, serviceId, (service) => ({
      ...service,
      routes: updateById(service.routes, routeId, (route) => ({
        ...route,
        pricings,
      })),
    }))

    setValue("services", updated, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const updatePricingField = ({
    serviceId,
    routeId,
    pricingId,
    patch,
  }: {
    serviceId: string
    routeId: string
    pricingId: string
    patch: Partial<{
      tons: string
      price: string | number
    }>
  }) => {
    const services = getValues("services")

    const updated = services.map((service) => {
      if (service.tempId !== serviceId) return service

      return {
        ...service,
        routes: service.routes.map((route) => {
          if (route.route_id !== routeId) return route

          return {
            ...route,
            pricings: route.pricings.map((p) =>
              p.id === pricingId
                ? {
                    ...p,
                    ...patch,
                  }
                : p
            ),
          }
        }),
      }
    })

    setValue("services", updated, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const addRoutes = ({
    serviceId,
    routes,
  }: {
    serviceId: string
    routes: RoutePricingStruct[]
  }) => {
    const services = getValues("services")

    const updated = services.map((service) => {
      if (service.tempId !== serviceId) return service

      return {
        ...service,
        routes: [...service.routes, ...routes],
      }
    })

    setValue("services", updated, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const syncRoutes = ({
    serviceId,
    routes,
  }: {
    serviceId: string
    routes: RoutePricingStruct[]
  }) => {
    const services = getValues("services")

    const updated = services.map((service) => {
      if (service.tempId !== serviceId) return service

      return {
        ...service,
        routes,
      }
    })

    setValue("services", updated, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const applyPricingUpdates = ({
    serviceId,
    updates,
  }: {
    serviceId: string
    updates: {
      routeId: string
      pricingId: string
      patch: Partial<{
        tons: string
        price: string | number
      }>
    }[]
  }) => {
    const services = getValues("services")

    const updated = services.map((service) => {
      if (service.tempId !== serviceId) return service

      return {
        ...service,
        routes: service.routes.map((route) => {
          const routeUpdates = updates.filter(
            (u) => u.routeId === route.route_id
          )

          if (routeUpdates.length === 0) return route

          return {
            ...route,
            pricings: route.pricings.map((pricing) => {
              const update = routeUpdates.find(
                (u) => u.pricingId === pricing.id
              )

              return update ? { ...pricing, ...update.patch } : pricing
            }),
          }
        }),
      }
    })

    setValue("services", updated, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  return {
    reorderPricings,
    updatePricingField,
    reorderRoutes,
    addRoutes,
    syncRoutes,
    applyPricingUpdates,
  }
}

function updateById<T extends { tempId: string }>(
  items: T[],
  id: EntityId,
  updater: (item: T) => T
): T[] {
  return items.map((item) => (item.tempId === id ? updater(item) : item))
}
