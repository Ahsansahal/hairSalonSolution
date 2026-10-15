/**
 * Standard salon currency formatter for Shay Salon (Karachi, Pakistan).
 * Formats numbers into clean "Rs. X,XXX" or "PKR" currency format.
 */
export function formatMoney(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") {
    return "0";
  }
  const num = typeof amount === "number" ? amount : parseFloat(String(amount));
  if (isNaN(num)) {
    return "0";
  }

  // If amount has no decimal cents (e.g. 3500.00), show clean "3,500"
  const hasCents = num % 1 !== 0;
  return num.toLocaleString("en-PK", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

export function formatCurrency(amount: number | string | null | undefined): string {
  return `Rs. ${formatMoney(amount)}`;
}
