/**
 * Money helpers. All amounts from the BarriApp API are **integer COP**
 * (e.g. 3500 = $3.500). Never do currency math in floats.
 */

const COP_FORMATTER = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Format an integer COP amount as e.g. `$ 3.500`. */
export function formatCOP(amount: number): string {
  return COP_FORMATTER.format(Math.round(amount));
}

/** Format an integer COP amount without the currency symbol, e.g. `3.500`. */
export function formatCOPNumber(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}
