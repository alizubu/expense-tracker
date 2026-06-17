import { Profile, Transaction, Budget, RecurringRule, User } from "./types";

// ── Mock User ───────────────────────────────────────────────

export const MOCK_USER: User = {
  id: "user_001",
  clerkId: "clerk_mock_001",
  name: "Arif Rahman",
  email: "arif@example.com",
  currency: "BDT",
  timezone: "Asia/Dhaka",
  createdAt: "2024-01-15T00:00:00Z",
};

// ── Mock Profiles ───────────────────────────────────────────

export const MOCK_PROFILES: Profile[] = [
  {
    id: "profile_001",
    userId: "user_001",
    name: "Moneybag",
    type: "MONEYBAG",
    icon: "Wallet",
    color: "#7C3AED",
    balance: 45250.0,
    description: "Main wallet for daily expenses",
    isDefault: true,
    sortOrder: 0,
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "profile_002",
    userId: "user_001",
    name: "DBBL Bank",
    type: "BANK",
    icon: "Landmark",
    color: "#3B82F6",
    balance: 182500.0,
    description: "Dutch-Bangla Bank savings",
    isDefault: false,
    sortOrder: 1,
    createdAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "profile_003",
    userId: "user_001",
    name: "bKash",
    type: "MOBILE_BANKING",
    icon: "Smartphone",
    color: "#F59E0B",
    balance: 12800.0,
    description: "Mobile banking account",
    isDefault: false,
    sortOrder: 2,
    createdAt: "2024-01-20T00:00:00Z",
  },
  {
    id: "profile_004",
    userId: "user_001",
    name: "Emergency Fund",
    type: "SAVINGS",
    icon: "PiggyBank",
    color: "#EC4899",
    balance: 75000.0,
    description: "Emergency savings",
    isDefault: false,
    sortOrder: 3,
    createdAt: "2024-02-01T00:00:00Z",
  },
];

// ── Helper: generate dates relative to "now" ────────────────

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));
  return d.toISOString();
}

// ── Mock Transactions ───────────────────────────────────────

export const MOCK_TRANSACTIONS: Transaction[] = [
  // ── Today ──
  {
    id: "txn_001", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 350, category: "coffee", title: "Morning coffee at Coffeeshop",
    date: daysAgo(0), isRecurring: false, tags: ["daily"], createdAt: daysAgo(0),
  },
  {
    id: "txn_002", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 1200, category: "restaurant", title: "Lunch at Star Kabab",
    note: "Team lunch", date: daysAgo(0), isRecurring: false, tags: ["food", "work"], createdAt: daysAgo(0),
  },
  {
    id: "txn_003", userId: "user_001", profileId: "profile_003",
    type: "EXPENSE", amount: 450, category: "rideshare", title: "Pathao ride to office",
    date: daysAgo(0), isRecurring: false, tags: ["transport"], createdAt: daysAgo(0),
  },
  // ── Yesterday ──
  {
    id: "txn_004", userId: "user_001", profileId: "profile_002",
    type: "INCOME", amount: 65000, category: "salary", title: "Monthly Salary - June",
    note: "Software Engineer salary", date: daysAgo(1), isRecurring: true, recurringId: "rec_001",
    tags: ["salary", "monthly"], createdAt: daysAgo(1),
  },
  {
    id: "txn_005", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 3500, category: "groceries", title: "Weekly groceries from Shwapno",
    date: daysAgo(1), isRecurring: false, tags: ["groceries", "weekly"], createdAt: daysAgo(1),
  },
  {
    id: "txn_006", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 800, category: "fastfood", title: "Pizza from Foodpanda",
    date: daysAgo(1), isRecurring: false, tags: ["delivery", "food"], createdAt: daysAgo(1),
  },
  // ── 2 days ago ──
  {
    id: "txn_007", userId: "user_001", profileId: "profile_002",
    type: "EXPENSE", amount: 15000, category: "rent", title: "House rent - June",
    note: "Monthly apartment rent", date: daysAgo(2), isRecurring: true, recurringId: "rec_002",
    tags: ["rent", "monthly"], createdAt: daysAgo(2),
  },
  {
    id: "txn_008", userId: "user_001", profileId: "profile_003",
    type: "EXPENSE", amount: 2500, category: "electricity", title: "DESCO electricity bill",
    date: daysAgo(2), isRecurring: false, tags: ["utility", "bill"], createdAt: daysAgo(2),
  },
  {
    id: "txn_009", userId: "user_001", profileId: "profile_001", toProfileId: "profile_004",
    type: "TRANSFER", amount: 10000, category: "savings", title: "Monthly savings transfer",
    date: daysAgo(2), isRecurring: true, recurringId: "rec_003", tags: ["savings"], createdAt: daysAgo(2),
  },
  // ── 3 days ago ──
  {
    id: "txn_010", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 1500, category: "medicine", title: "Pharmacy - vitamins",
    date: daysAgo(3), isRecurring: false, tags: ["health"], createdAt: daysAgo(3),
  },
  {
    id: "txn_011", userId: "user_001", profileId: "profile_003",
    type: "EXPENSE", amount: 999, category: "streaming", title: "Netflix subscription",
    date: daysAgo(3), isRecurring: true, recurringId: "rec_004", tags: ["subscription"], createdAt: daysAgo(3),
  },
  // ── 4 days ago ──
  {
    id: "txn_012", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 4200, category: "clothing", title: "New shirt from Aarong",
    date: daysAgo(4), isRecurring: false, tags: ["shopping"], createdAt: daysAgo(4),
  },
  {
    id: "txn_013", userId: "user_001", profileId: "profile_002",
    type: "INCOME", amount: 15000, category: "freelance", title: "Freelance web project payment",
    note: "Client: ABC Corp", date: daysAgo(4), isRecurring: false, tags: ["freelance", "income"], createdAt: daysAgo(4),
  },
  // ── 5 days ago ──
  {
    id: "txn_014", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 650, category: "publictransit", title: "Bus fare",
    date: daysAgo(5), isRecurring: false, tags: ["transport"], createdAt: daysAgo(5),
  },
  {
    id: "txn_015", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 2200, category: "gym", title: "Gym monthly membership",
    date: daysAgo(5), isRecurring: true, recurringId: "rec_005", tags: ["health", "fitness"], createdAt: daysAgo(5),
  },
  // ── 6 days ago ──
  {
    id: "txn_016", userId: "user_001", profileId: "profile_003",
    type: "EXPENSE", amount: 1800, category: "internet", title: "Amber IT internet bill",
    date: daysAgo(6), isRecurring: true, tags: ["utility", "monthly"], createdAt: daysAgo(6),
  },
  {
    id: "txn_017", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 500, category: "coffee", title: "Coffee with friends",
    date: daysAgo(6), isRecurring: false, tags: ["social"], createdAt: daysAgo(6),
  },
  // ── Last week ──
  {
    id: "txn_018", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 3800, category: "electronics", title: "Phone charger & accessories",
    date: daysAgo(8), isRecurring: false, tags: ["shopping", "tech"], createdAt: daysAgo(8),
  },
  {
    id: "txn_019", userId: "user_001", profileId: "profile_002",
    type: "EXPENSE", amount: 5000, category: "donation", title: "Monthly Zakat payment",
    date: daysAgo(9), isRecurring: true, tags: ["charity"], createdAt: daysAgo(9),
  },
  {
    id: "txn_020", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 1100, category: "movies", title: "Star Cineplex - tickets",
    date: daysAgo(10), isRecurring: false, tags: ["entertainment"], createdAt: daysAgo(10),
  },
  {
    id: "txn_021", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 850, category: "delivery", title: "FoodPanda delivery",
    date: daysAgo(10), isRecurring: false, tags: ["food"], createdAt: daysAgo(10),
  },
  {
    id: "txn_022", userId: "user_001", profileId: "profile_002",
    type: "INCOME", amount: 8000, category: "bonus", title: "Performance bonus Q2",
    date: daysAgo(11), isRecurring: false, tags: ["income", "bonus"], createdAt: daysAgo(11),
  },
  // ── 2 weeks ago ──
  {
    id: "txn_023", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 6500, category: "doctor", title: "Doctor visit & tests",
    note: "Annual health checkup", date: daysAgo(14), isRecurring: false, tags: ["health"], createdAt: daysAgo(14),
  },
  {
    id: "txn_024", userId: "user_001", profileId: "profile_003",
    type: "EXPENSE", amount: 2000, category: "books", title: "Programming books from Rokomari",
    date: daysAgo(15), isRecurring: false, tags: ["education", "books"], createdAt: daysAgo(15),
  },
  {
    id: "txn_025", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 750, category: "fuel", title: "Bike fuel",
    date: daysAgo(16), isRecurring: false, tags: ["transport"], createdAt: daysAgo(16),
  },
  {
    id: "txn_026", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 3200, category: "gifts", title: "Birthday gift for friend",
    date: daysAgo(17), isRecurring: false, tags: ["gift", "social"], createdAt: daysAgo(17),
  },
  // ── 3 weeks ago ──
  {
    id: "txn_027", userId: "user_001", profileId: "profile_002",
    type: "EXPENSE", amount: 12000, category: "insurance", title: "Health insurance premium",
    date: daysAgo(21), isRecurring: true, tags: ["insurance", "quarterly"], createdAt: daysAgo(21),
  },
  {
    id: "txn_028", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 1400, category: "stationery", title: "Office supplies",
    date: daysAgo(22), isRecurring: false, tags: ["work"], createdAt: daysAgo(22),
  },
  {
    id: "txn_029", userId: "user_001", profileId: "profile_003",
    type: "INCOME", amount: 5000, category: "refund", title: "Daraz refund",
    date: daysAgo(23), isRecurring: false, tags: ["refund"], createdAt: daysAgo(23),
  },
  {
    id: "txn_030", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 900, category: "parking", title: "Monthly parking spot",
    date: daysAgo(24), isRecurring: true, tags: ["transport"], createdAt: daysAgo(24),
  },
  // ── Last month ──
  {
    id: "txn_031", userId: "user_001", profileId: "profile_002",
    type: "INCOME", amount: 65000, category: "salary", title: "Monthly Salary - May",
    date: daysAgo(31), isRecurring: true, tags: ["salary"], createdAt: daysAgo(31),
  },
  {
    id: "txn_032", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 8500, category: "groceries", title: "Monthly groceries",
    date: daysAgo(32), isRecurring: false, tags: ["groceries"], createdAt: daysAgo(32),
  },
  {
    id: "txn_033", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 2800, category: "restaurant", title: "Family dinner",
    date: daysAgo(33), isRecurring: false, tags: ["food", "family"], createdAt: daysAgo(33),
  },
  {
    id: "txn_034", userId: "user_001", profileId: "profile_002",
    type: "EXPENSE", amount: 15000, category: "rent", title: "House rent - May",
    date: daysAgo(35), isRecurring: true, tags: ["rent"], createdAt: daysAgo(35),
  },
  {
    id: "txn_035", userId: "user_001", profileId: "profile_001",
    type: "EXPENSE", amount: 5500, category: "electronics", title: "Wireless earbuds",
    date: daysAgo(36), isRecurring: false, tags: ["shopping", "tech"], createdAt: daysAgo(36),
  },
];

// ── Mock Budgets ────────────────────────────────────────────

const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

export const MOCK_BUDGETS: Budget[] = [
  { id: "bgt_001", userId: "user_001", category: "groceries",  limit: 8000,  period: "monthly", spent: 3500,  month: currentMonth, year: currentYear },
  { id: "bgt_002", userId: "user_001", category: "restaurant", limit: 5000,  period: "monthly", spent: 4000,  month: currentMonth, year: currentYear },
  { id: "bgt_003", userId: "user_001", category: "rideshare",  limit: 3000,  period: "monthly", spent: 1900,  month: currentMonth, year: currentYear },
  { id: "bgt_004", userId: "user_001", category: "coffee",     limit: 2000,  period: "monthly", spent: 1850,  month: currentMonth, year: currentYear },
  { id: "bgt_005", userId: "user_001", category: "streaming",  limit: 1500,  period: "monthly", spent: 999,   month: currentMonth, year: currentYear },
  { id: "bgt_006", userId: "user_001", category: "clothing",   limit: 5000,  period: "monthly", spent: 4200,  month: currentMonth, year: currentYear },
  { id: "bgt_007", userId: "user_001", category: "electricity",limit: 3000,  period: "monthly", spent: 2500,  month: currentMonth, year: currentYear },
  { id: "bgt_008", userId: "user_001", category: "delivery",   limit: 2000,  period: "monthly", spent: 2150,  month: currentMonth, year: currentYear },
];

// ── Mock Recurring Rules ────────────────────────────────────

export const MOCK_RECURRING: RecurringRule[] = [
  { id: "rec_001", userId: "user_001", title: "Monthly Salary",          amount: 65000, type: "INCOME",   category: "salary",     profileId: "profile_002", frequency: "monthly", nextDate: daysAgo(-15), isActive: true },
  { id: "rec_002", userId: "user_001", title: "House Rent",              amount: 15000, type: "EXPENSE",  category: "rent",       profileId: "profile_002", frequency: "monthly", nextDate: daysAgo(-28), isActive: true },
  { id: "rec_003", userId: "user_001", title: "Savings Transfer",        amount: 10000, type: "TRANSFER", category: "savings",    profileId: "profile_001", frequency: "monthly", nextDate: daysAgo(-25), isActive: true },
  { id: "rec_004", userId: "user_001", title: "Netflix Subscription",    amount: 999,   type: "EXPENSE",  category: "streaming",  profileId: "profile_003", frequency: "monthly", nextDate: daysAgo(-27), isActive: true },
  { id: "rec_005", userId: "user_001", title: "Gym Membership",          amount: 2200,  type: "EXPENSE",  category: "gym",        profileId: "profile_001", frequency: "monthly", nextDate: daysAgo(-25), isActive: true },
  { id: "rec_006", userId: "user_001", title: "Internet Bill",           amount: 1800,  type: "EXPENSE",  category: "internet",   profileId: "profile_003", frequency: "monthly", nextDate: daysAgo(-24), isActive: true },
];

// ── Analytics mock data ─────────────────────────────────────

export const MOCK_MONTHLY_DATA = [
  { month: "Jan", income: 65000, expense: 42000, savings: 23000 },
  { month: "Feb", income: 72000, expense: 48000, savings: 24000 },
  { month: "Mar", income: 65000, expense: 51000, savings: 14000 },
  { month: "Apr", income: 80000, expense: 45000, savings: 35000 },
  { month: "May", income: 73000, expense: 52000, savings: 21000 },
  { month: "Jun", income: 88000, expense: 38000, savings: 50000 },
];

// ── Computed helpers ────────────────────────────────────────

export function getTotalBalance(): number {
  return MOCK_PROFILES.reduce((sum, p) => sum + p.balance, 0);
}

export function getThisMonthIncome(): number {
  const now = new Date();
  return MOCK_TRANSACTIONS
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === "INCOME" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getThisMonthExpense(): number {
  const now = new Date();
  return MOCK_TRANSACTIONS
    .filter((t) => {
      const d = new Date(t.date);
      return t.type === "EXPENSE" && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getSavingsRate(): number {
  const income = getThisMonthIncome();
  const expense = getThisMonthExpense();
  if (income === 0) return 0;
  return Math.round(((income - expense) / income) * 100);
}
