export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimals: number;
}

export const CURRENCIES: Currency[] = [
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka",  locale: "bn-BD", decimals: 2 },
  { code: "USD", symbol: "$", name: "US Dollar",          locale: "en-US", decimals: 2 },
  { code: "EUR", symbol: "€", name: "Euro",               locale: "de-DE", decimals: 2 },
  { code: "GBP", symbol: "£", name: "British Pound",      locale: "en-GB", decimals: 2 },
  { code: "INR", symbol: "₹", name: "Indian Rupee",       locale: "en-IN", decimals: 2 },
];

export const DEFAULT_CURRENCY = "BDT";

export function getCurrency(code: string): Currency | undefined {
  return CURRENCIES.find((c) => c.code === code);
}

export function getCurrencySymbol(code: string): string {
  return getCurrency(code)?.symbol ?? "৳";
}

export function formatCurrency(
  amount: number,
  currencyCode: string = DEFAULT_CURRENCY,
  compact: boolean = false
): string {
  const currency = getCurrency(currencyCode);
  if (!currency) return `${amount}`;

  if (compact && Math.abs(amount) >= 1000) {
    const formatter = new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1,
    });
    return `${currency.symbol} ${formatter.format(amount)}`;
  }

  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  });

  return `${currency.symbol} ${formatter.format(amount)}`;
}
