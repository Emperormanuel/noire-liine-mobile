// Prices are stored in kobo (1 naira = 100 kobo) in the database.
export function money(kobo) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(kobo / 100);
}
