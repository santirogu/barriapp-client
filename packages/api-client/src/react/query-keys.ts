/** Centralized React Query keys so invalidation stays consistent across hooks. */
export const queryKeys = {
  me: () => ['me'] as const,

  stores: (params?: object) => ['stores', params ?? {}] as const,
  myStores: () => ['stores', 'mine'] as const,
  store: (id: string) => ['stores', id] as const,
  storeProducts: (storeId: string, params?: object) =>
    ['stores', storeId, 'products', params ?? {}] as const,
  product: (id: string) => ['products', id] as const,
  categories: (type?: string) => ['categories', type ?? 'all'] as const,

  orders: (params?: object) => ['orders', params ?? {}] as const,
  order: (id: string) => ['orders', id] as const,

  payment: (id: string) => ['payments', id] as const,

  errands: (params?: object) => ['errands', params ?? {}] as const,
  errand: (id: string) => ['errands', id] as const,

  notifications: (params?: object) =>
    ['notifications', params ?? {}] as const,
  notificationsUnread: () => ['notifications', 'unread-count'] as const,

  delivery: (id: string) => ['deliveries', id] as const,
  collaboratorMe: () => ['collaborator', 'me'] as const,
} as const;
