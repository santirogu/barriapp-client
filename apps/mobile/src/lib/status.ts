import type { OrderStatus } from '@barriapp/shared';

/** User-facing Spanish labels for order statuses. */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptado',
  preparing: 'En preparación',
  ready: 'Listo',
  assigned: 'Repartidor asignado',
  picked_up: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
};

/** Ordered steps shown in the tracking timeline (excludes cancelled). */
export const ORDER_STEPS: OrderStatus[] = [
  'pending',
  'accepted',
  'preparing',
  'ready',
  'assigned',
  'picked_up',
  'delivered',
];
