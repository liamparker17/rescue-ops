export function formatZAR(cents: number): string {
  const isNegative = cents < 0;
  const absolute = Math.abs(cents);
  const rand = absolute / 100;
  const formatted = rand.toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isNegative ? `-R ${formatted}` : `R ${formatted}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function centsToRand(cents: number): number {
  return cents / 100;
}

export function randToCents(rand: number): number {
  return Math.round(rand * 100);
}
