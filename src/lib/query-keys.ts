export const queryKeys = {
  dashboard: {
    all: () => ({ queryKey: [""] }),
    list: () => ({ queryKey: ["", "list"] }),
    details: (id: string) => ({ queryKey: ["", "detail", id] }),
  },

  rides: {
    all: () => ({ queryKey: [""] }),
    list: () => ({ queryKey: ["", "list"] }),
    details: (id: string) => ({ queryKey: ["", "detail", id] }),
  },

  bookings: {
    all: () => ({ queryKey: [""] }),
    list: () => ({ queryKey: ["", "list"] }),
    details: (id: string) => ({ queryKey: ["", "detail", id] }),
  },

  payments: {
    all: () => ({ queryKey: [""] }),
    list: () => ({ queryKey: ["", "list"] }),
    details: (id: string) => ({ queryKey: ["", "detail", id] }),
  },

  setiings: {
    app: () => ({ queryKey: [""] }),

    routes: {
      all: () => ({ queryKey: [""] }),
      list: () => ({ queryKey: ["", "list"] }),
      details: (id: string) => ({ queryKey: ["", "detail", id] }),
    },
    taxRates: {
      all: () => ({ queryKey: [""] }),
      list: () => ({ queryKey: ["", "list"] }),
      details: (id: string) => ({ queryKey: ["", "detail", id] }),
    },
    roles: {
      all: () => ({ queryKey: [""] }),
      list: () => ({ queryKey: ["", "list"] }),
      details: (id: string) => ({ queryKey: ["", "detail", id] }),
    },
    permissions: {
      all: () => ({ queryKey: [""] }),
      list: () => ({ queryKey: ["", "list"] }),
      details: (id: string) => ({ queryKey: ["", "detail", id] }),
    },
    pricingPlans: {
      all: () => ({ queryKey: [""] }),
      list: () => ({ queryKey: ["", "list"] }),
      details: (id: string) => ({ queryKey: ["", "detail", id] }),
    },
    carBrands: {
      list: () => ({ queryKey: ["", "list"] }),
      details: (id: string) => ({ queryKey: ["", "detail", id] }),
    },
    carModels: {
      list: () => ({ queryKey: ["", "detail"] }),
      details: (id: string) => ({ queryKey: ["", "detail", id] }),
    },
    driveTrains: {
      list: () => ({ queryKey: ["", "list"] }),
      details: (id: string) => ({ queryKey: ["", "detail", id] }),
    },
    tonnages: {
      list: () => ({ queryKey: ["", "list"] }),
      details: (id: string) => ({ queryKey: ["", "detail", id] }),
    },
    vehiclesTypes: {
      list: () => ({ queryKey: ["", "list"] }),
      details: (id: string) => ({ queryKey: ["", "detail", id] }),
    },
  },

  drivers: {
    all: () => ({ queryKey: [""] }),
    list: () => ({ queryKey: ["", "list"] }),
    details: (id: string) => ({ queryKey: ["", "detail", id] }),
  },

  clients: {
    all: () => ({ queryKey: [""] }),
    list: () => ({ queryKey: ["", "list"] }),
    details: (id: string) => ({ queryKey: ["", "detail", id] }),
  },

  users: {
    all: () => ({ queryKey: [""] }),
    list: () => ({ queryKey: ["", "list"] }),
    details: (id: string) => ({ queryKey: ["", "detail", id] }),
  },

  vehicles: {
    all: () => ({ queryKey: [""] }),
    list: () => ({ queryKey: ["", "list"] }),
    details: (id: string) => ({ queryKey: ["", "detail", id] }),
  },

  auditLogs: {
    all: () => ({ queryKey: [""] }),
    list: () => ({ queryKey: ["", "list"] }),
    details: (id: string) => ({ queryKey: ["", "detail", id] }),
  },
}
