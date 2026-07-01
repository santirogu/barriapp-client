import {
  DELIVERY_STATUS_LABEL,
  ERRAND_STATUS_LABEL,
  ORDER_STATUS_LABEL,
  nextDeliveryStatus,
} from './status';

describe('status helpers', () => {
  it('advances a delivery to the next status, or null when delivered', () => {
    expect(nextDeliveryStatus('assigned')).toBe('en_route_pickup');
    expect(nextDeliveryStatus('picked_up')).toBe('en_route_dropoff');
    expect(nextDeliveryStatus('delivered')).toBeNull();
  });

  it('has Spanish labels for order/delivery/errand statuses', () => {
    expect(ORDER_STATUS_LABEL.delivered).toBe('Entregado');
    expect(DELIVERY_STATUS_LABEL.picked_up).toBe('Pedido recogido');
    expect(ERRAND_STATUS_LABEL.completed).toBe('Completado');
  });
});
