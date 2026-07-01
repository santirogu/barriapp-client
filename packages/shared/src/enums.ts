/** Domain enums mirrored from the backend module contracts (FRONTEND.md files). */

export type Role = 'client' | 'seller' | 'collaborator' | 'super_admin';

export type UserStatus = 'pending_verification' | 'active' | 'suspended';

export type StoreStatus = 'open' | 'closed' | 'suspended';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'assigned'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'wompi';

export type PaymentStatus = 'pending' | 'approved' | 'declined' | 'refunded';

export type DeliveryStatus =
  | 'assigned'
  | 'en_route_pickup'
  | 'picked_up'
  | 'en_route_dropoff'
  | 'delivered';

export type ErrandStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type VehicleType = 'walk' | 'bike' | 'motorcycle' | 'car';

export type VerificationStatus =
  | 'pending'
  | 'under_review'
  | 'needs_more_info'
  | 'approved'
  | 'rejected';

export type Availability = 'offline' | 'online' | 'on_delivery';

/** Order statuses in which the client can still cancel (before pickup). */
export const CANCELLABLE_ORDER_STATUSES: readonly OrderStatus[] = [
  'pending',
  'accepted',
  'preparing',
  'ready',
];

/** Whether an order is in a terminal state. */
export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return status === 'delivered' || status === 'cancelled';
}
