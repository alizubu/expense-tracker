export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  group: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  // ── Food & Drink ──────────────────────────────────────
  {
    id: "groceries",
    label: "Groceries",
    icon: "ShoppingCart",
    color: "#10B981",
    group: "Food & Drink",
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: "UtensilsCrossed",
    color: "#F59E0B",
    group: "Food & Drink",
  },
  {
    id: "drinks",
    label: "Drinks",
    icon: "CupSoda",
    color: "#0EA5E9",
    group: "Food & Drink",
  },
  {
    id: "food",
    label: "Food",
    icon: "Utensils",
    color: "#EF4444",
    group: "Food & Drink",
  },

  // ── Transport ─────────────────────────────────────────
  {
    id: "rideshare",
    label: "Ride Share",
    icon: "Car",
    color: "#06B6D4",
    group: "Transport",
  },
  {
    id: "publictransit",
    label: "Public Transit",
    icon: "Bus",
    color: "#0EA5E9",
    group: "Transport",
  },
  {
    id: "taxi",
    label: "Taxi",
    icon: "CarTaxiFront",
    color: "#FACC15",
    group: "Transport",
  },

  // ── Housing & Utilities ───────────────────────────────
  {
    id: "laundry",
    label: "Laundry",
    icon: "WashingMachine",
    color: "#22D3EE",
    group: "Housing",
  },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: "Wrench",
    color: "#A3A3A3",
    group: "Housing",
  },

  // ── Health & Wellness ─────────────────────────────────
  {
    id: "medicine",
    label: "Medicine",
    icon: "Pill",
    color: "#EC4899",
    group: "Health",
  },
  {
    id: "doctor",
    label: "Doctor / Hospital",
    icon: "Stethoscope",
    color: "#EF4444",
    group: "Health",
  },

  // ── Shopping ──────────────────────────────────────────
  {
    id: "clothing",
    label: "Clothing",
    icon: "Shirt",
    color: "#F472B6",
    group: "Shopping",
  },
  {
    id: "electronics",
    label: "Electronics",
    icon: "Cpu",
    color: "#38BDF8",
    group: "Shopping",
  },
  {
    id: "homegood",
    label: "Home & Decor",
    icon: "Sofa",
    color: "#A3E635",
    group: "Shopping",
  },
  {
    id: "gifts",
    label: "Gifts",
    icon: "Gift",
    color: "#F43F5E",
    group: "Shopping",
  },
  {
    id: "beauty",
    label: "Beauty & Care",
    icon: "Sparkles",
    color: "#E879F9",
    group: "Shopping",
  },

  // ── Entertainment ─────────────────────────────────────
  {
    id: "gaming",
    label: "Gaming",
    icon: "Gamepad2",
    color: "#8B5CF6",
    group: "Entertainment",
  },
  {
    id: "sports",
    label: "Sports & Events",
    icon: "Trophy",
    color: "#3B82F6",
    group: "Entertainment",
  },
  {
    id: "travel",
    label: "Travel",
    icon: "Map",
    color: "#06B6D4",
    group: "Entertainment",
  },

  // ── Education ─────────────────────────────────────────
  {
    id: "books",
    label: "Books",
    icon: "BookOpen",
    color: "#F97316",
    group: "Education",
  },
  {
    id: "courses",
    label: "Online Courses",
    icon: "Monitor",
    color: "#6366F1",
    group: "Education",
  },
  {
    id: "stationery",
    label: "Stationery",
    icon: "PenLine",
    color: "#94A3B8",
    group: "Education",
  },

  // ── Finance ───────────────────────────────────────────
  {
    id: "loanpayment",
    label: "Loan Payment",
    icon: "Landmark",
    color: "#EF4444",
    group: "Finance",
  },
  {
    id: "investment",
    label: "Investment",
    icon: "TrendingUp",
    color: "#22C55E",
    group: "Finance",
  },
  {
    id: "savings",
    label: "Savings",
    icon: "PiggyBank",
    color: "#F59E0B",
    group: "Finance",
  },
  {
    id: "tax",
    label: "Tax",
    icon: "Receipt",
    color: "#EF4444",
    group: "Finance",
  },

  // ── Family & Kids ─────────────────────────────────────
  {
    id: "childcare",
    label: "Childcare",
    icon: "Baby",
    color: "#FB7185",
    group: "Family",
  },

  // ── Subscriptions ─────────────────────────────────────
  {
    id: "wifi_bill",
    label: "WiFi Bill",
    icon: "Wifi",
    color: "#38BDF8",
    group: "Subscriptions",
  },

  // ── Income ────────────────────────────────────────────
  {
    id: "salary",
    label: "Salary",
    icon: "Banknote",
    color: "#10B981",
    group: "Income",
  },
  {
    id: "freelance",
    label: "Freelance",
    icon: "Laptop",
    color: "#8B5CF6",
    group: "Income",
  },
  {
    id: "business",
    label: "Business",
    icon: "Briefcase",
    color: "#F59E0B",
    group: "Income",
  },
  {
    id: "gift_income",
    label: "Gift Received",
    icon: "PackagePlus",
    color: "#F472B6",
    group: "Income",
  },

  // ── Other ─────────────────────────────────────────────
  {
    id: "fines",
    label: "Fines & Penalties",
    icon: "AlertCircle",
    color: "#F97316",
    group: "Other",
  },
  {
    id: "miscellaneous",
    label: "Miscellaneous",
    icon: "MoreHorizontal",
    color: "#64748B",
    group: "Other",
  },
];

// Helper functions
export function getCategoryById(id: string): Category | undefined {
  return EXPENSE_CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoriesByGroup(group: string): Category[] {
  return EXPENSE_CATEGORIES.filter((cat) => cat.group === group);
}

export function getIncomeCategories(): Category[] {
  return EXPENSE_CATEGORIES.filter((cat) => cat.group === "Income");
}

export function getExpenseCategories(): Category[] {
  return EXPENSE_CATEGORIES.filter((cat) => cat.group !== "Income");
}

export function getCategoryGroups(): string[] {
  return Array.from(new Set(EXPENSE_CATEGORIES.map((cat) => cat.group)));
}

export function searchCategories(query: string): Category[] {
  const lower = query.toLowerCase();
  return EXPENSE_CATEGORIES.filter(
    (cat) =>
      cat.label.toLowerCase().includes(lower) ||
      cat.group.toLowerCase().includes(lower) ||
      cat.id.toLowerCase().includes(lower),
  );
}
