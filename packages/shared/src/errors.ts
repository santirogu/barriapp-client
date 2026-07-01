/**
 * Canonical API error shape and a fallback Spanish message map keyed by the
 * stable `error.code`. The API's own `message` is preferred when present; this
 * map is a fallback for known codes (and lets the UI localize consistently).
 */

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/** Fallback user-facing text (es-CO) for stable error codes across modules. */
export const ERROR_MESSAGES: Record<string, string> = {
  // auth
  invalid_credentials: 'Teléfono o contraseña incorrectos.',
  not_verified: 'Verifica el código que enviamos a tu teléfono.',
  account_suspended: 'Tu cuenta está suspendida. Contacta a soporte.',
  invalid_otp: 'El código es incorrecto o expiró.',
  invalid_token: 'Tu sesión expiró. Inicia sesión de nuevo.',
  phone_taken: 'Ese teléfono ya está registrado.',
  email_taken: 'Ese correo ya está registrado.',
  consent_required: 'Debes aceptar el tratamiento de datos (Habeas Data).',
  invalid_social_token: 'No pudimos validar tu cuenta social.',
  provider_not_configured: 'Ese método de inicio de sesión no está disponible.',
  // generic
  validation_error: 'Revisa los datos ingresados.',
  not_found: 'No se encontró el recurso.',
  forbidden: 'No tienes permiso para esta acción.',
  not_authenticated: 'Inicia sesión para continuar.',
  // stores / catalog / orders
  store_not_open: 'La tienda no está abierta en este momento.',
  store_unavailable: 'La tienda no está disponible.',
  invalid_product: 'Un producto del carrito no pertenece a la tienda.',
  product_unavailable: 'Un producto ya no está disponible.',
  insufficient_stock: 'No hay suficiente inventario.',
  below_min_order: 'El pedido no alcanza el mínimo de la tienda.',
  invalid_transition: 'Esa acción no es válida para el estado actual.',
  // delivery
  order_not_ready: 'El pedido aún no está listo para asignar.',
  already_assigned: 'El pedido ya tiene repartidor.',
  no_collaborator: 'No hay repartidores disponibles cerca.',
  // reviews
  not_delivered: 'Solo puedes calificar pedidos entregados.',
  already_reviewed: 'Ya calificaste este pedido.',
};

/** Resolve the best message for an API error, preferring the server message. */
export function resolveErrorMessage(body: ApiErrorBody | null | undefined): string {
  if (!body?.error) return 'Ocurrió un error. Intenta de nuevo.';
  const { code, message } = body.error;
  return message || ERROR_MESSAGES[code] || 'Ocurrió un error. Intenta de nuevo.';
}
