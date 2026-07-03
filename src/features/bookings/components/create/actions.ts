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
            pricing: { ...route.pricing, ...patch },
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
            pricing: route.pricing.map((pricing) => {
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

  function upsertRoutePricing(
  services: any[],
  serviceId: string,
  route: any
) {
  return services.map((s) => {
    if (s.id !== serviceId) return s;

    const existingIndex = s.routes.findIndex(
      (r: any) => r.route_id === route.route_id
    );

    // ➜ add
    if (existingIndex === -1) {
      return {
        ...s,
        routes: [...s.routes, route],
      };
    }

    // ➜ update or remove
    const updatedRoutes = s.routes
      .map((r: any) =>
        r.route_id === route.route_id ? route : r
      )
      // remove if pricing missing (strict rule)
      .filter((r: any) => r.pricing !== null);

    return {
      ...s,
      routes: updatedRoutes,
    };
  });
}

  return {
    reorderPricings,
    updatePricingField,
    reorderRoutes,
    addRoutes,
    syncRoutes,
    applyPricingUpdates,
    upsertRoutePricing,
  }
}

function updateById<T extends { tempId: string }>(
  items: T[],
  id: EntityId,
  updater: (item: T) => T
): T[] {
  return items.map((item) => (item.tempId === id ? updater(item) : item))
}
