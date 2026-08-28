export const STORE_LOCALE = "es-CO";
export const ADMIN_LOCALE = "es-CL";

export function formatPrice(value, { locale = STORE_LOCALE, decimals } = {}) {
  const options =
    decimals === undefined
      ? {}
      : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  return Number(value || 0).toLocaleString(locale, options);
}
