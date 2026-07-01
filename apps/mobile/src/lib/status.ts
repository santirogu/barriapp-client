import type { DeliveryStatus, ErrandStatus, OrderStatus } from '@barriapp/shared';

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

/** User-facing Spanish labels for delivery (courier) statuses. */
export const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  assigned: 'Repartidor asignado',
  en_route_pickup: 'En camino a la tienda',
  picked_up: 'Pedido recogido',
  en_route_dropoff: 'En camino a ti',
  delivered: 'Entregado',
};

/** Forward order of delivery statuses driven by the collaborator. */
export const DELIVERY_STEPS: DeliveryStatus[] = [
  'assigned',
  'en_route_pickup',
  'picked_up',
  'en_route_dropoff',
  'delivered',
];

/** The next status a collaborator can advance to, or null if delivered. */
export function nextDeliveryStatus(current: DeliveryStatus): DeliveryStatus | null {
  const i = DELIVERY_STEPS.indexOf(current);
  return i >= 0 && i < DELIVERY_STEPS.length - 1 ? DELIVERY_STEPS[i + 1]! : null;
}

/** Verb for advancing to each delivery status (collaborator action label). */
export const DELIVERY_ADVANCE_LABEL: Record<DeliveryStatus, string> = {
  assigned: '',
  en_route_pickup: 'Voy a la tienda',
  picked_up: 'Recogí el pedido',
  en_route_dropoff: 'En camino al cliente',
  delivered: 'Entregué',
};

/** User-facing Spanish labels for errand ("mandado") statuses. */
export const ERRAND_STATUS_LABEL: Record<ErrandStatus, string> = {
  open: 'Abierto',
  assigned: 'Aceptado',
  in_progress: 'En progreso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};
