# Personal Expense Tracker

A modern, full-stack Personal Expense Tracker built with Next.js 14 (App Router), Prisma, NextAuth, and Tailwind CSS. The application allows users to effortlessly manage their finances, track transactions, set budgets, and visualize their spending habits with beautiful interactive charts.

## 🚀 Features

- **Authentication**: Secure sign-in and sign-up flows using NextAuth.js.
- **Dashboard Overview**: Get a quick glance at your net balance, recent transactions, and spending summaries.
- **Multiple Profiles**: Create and manage multiple financial profiles to organize personal vs. business expenses.
- **Transaction Management**: Add, edit, and organize individual transactions seamlessly.
- **Interactive Analytics**: Visualize your spending habits through category donuts, daily line charts, and monthly bar charts (powered by Recharts).
- **Budgeting**: Set and monitor your budgets to keep your expenses in check.
- **Recurring Expenses**: Keep track of subscriptions and recurring monthly bills.
- **Modern UI/UX**: Fully responsive, accessible, and beautifully animated using Tailwind CSS, Framer Motion, and MagicUI components.
- **Dark/Light Mode**: Full theme customization depending on your preferences.

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [MagicUI](https://magicui.design/), [Lucide Icons](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## 📂 Project File Structure

```text
expense-tracker/
├── prisma/
│   └── schema.prisma             # Database schema and models
├── src/
│   ├── app/                      # Next.js App Router root
│   │   ├── (auth)/               # Auth routes group
│   │   │   ├── sign-in/
│   │   │   │   └── page.tsx      # Sign-in page
│   │   │   └── sign-up/
│   │   │       └── page.tsx      # Sign-up page
│   │   ├── (dashboard)/          # Dashboard routes group
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx      # Analytics view
│   │   │   ├── budgets/
│   │   │   │   └── page.tsx      # Budgets view
│   │   │   ├── profiles/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx  # Dynamic profile details
│   │   │   │   └── page.tsx      # Profiles list view
│   │   │   ├── recurring/
│   │   │   │   └── page.tsx      # Recurring transactions view
│   │   │   ├── settings/
│   │   │   │   └── page.tsx      # App settings view
│   │   │   ├── transactions/
│   │   │   │   └── page.tsx      # Transactions list view
│   │   │   ├── layout.tsx        # Dashboard specific layout
│   │   │   └── page.tsx          # Dashboard overview home
│   │   ├── api/                  # Backend API routes
│   │   │   ├── auth/[...nextauth]/
│   │   │   │   └── route.ts      # NextAuth.js endpoints
│   │   │   ├── dashboard/
│   │   │   │   └── route.ts      # Dashboard stats API
│   │   │   ├── profiles/
│   │   │   │   └── route.ts      # Profiles CRUD API
│   │   │   ├── register/
│   │   │   │   └── route.ts      # User registration API
│   │   │   ├── transactions/
│   │   │   │   └── route.ts      # Transactions CRUD API
│   │   │   └── user/
│   │   │       └── route.ts      # User details API
│   │   ├── fonts/                # Custom local fonts
│   │   │   ├── GeistMonoVF.woff
│   │   │   └── GeistVF.woff
│   │   ├── onboarding/
│   │   │   └── page.tsx          # Initial onboarding flow
│   │   ├── error.tsx             # Global error boundary
│   │   ├── favicon.ico           # Website favicon
│   │   ├── globals.css           # Global Tailwind CSS file
│   │   ├── layout.tsx            # Root application layout
│   │   └── loading.tsx           # Global loading state
│   ├── components/               # React components directory
│   │   ├── analytics/
│   │   │   ├── AnalyticsStatsRow.tsx
│   │   │   ├── CategoryDonutChart.tsx
│   │   │   ├── DailyLineChart.tsx
│   │   │   ├── MonthlyBarChart.tsx
│   │   │   ├── ProfileAreaChart.tsx
│   │   │   └── TopCategories.tsx
│   │   ├── budgets/
│   │   │   └── SetBudgetModal.tsx
│   │   ├── dashboard/
│   │   │   ├── BudgetProgress.tsx
│   │   │   ├── DashboardClient.tsx
│   │   │   ├── NetBalanceCard.tsx
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   ├── SpendingChart.tsx
│   │   │   └── TransactionFeed.tsx
│   │   ├── layout/
│   │   │   ├── ClientLayoutWrapper.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   ├── magicui/              # MagicUI animated components
│   │   │   ├── animated-gradient-text.tsx
│   │   │   ├── animated-list.tsx
│   │   │   ├── blur-fade.tsx
│   │   │   ├── border-beam.tsx
│   │   │   ├── magic-card.tsx
│   │   │   ├── meteors.tsx
│   │   │   ├── number-ticker.tsx
│   │   │   ├── shimmer-button.tsx
│   │   │   └── sparkles.tsx
│   │   ├── profiles/
│   │   │   └── CreateProfileModal.tsx
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── transactions/
│   │   │   ├── AccountSelector.tsx       # Animated custom dropdown for profile selection
│   │   │   ├── AddTransactionModal.tsx   # Modal for adding new transactions
│   │   │   ├── CategoryGrid.tsx          # Interactive 3-column category grid
│   │   │   ├── ConfirmButton.tsx         # Glowing animated submit button
│   │   │   └── EditTransactionModal.tsx  # Modal for editing existing transactions
│   ├── lib/                      # Helper functions and configurations
│   │   ├── auth.ts               # NextAuth setup and options
│   │   ├── categories.ts         # Expense category definitions
│   │   ├── currencies.ts         # Supported currencies setup
│   │   ├── formatters.ts         # Currency and Date formatting
│   │   ├── prisma.ts             # Prisma DB client initialization
│   │   ├── profile-types.ts      # Profile TS interfaces
│   │   ├── profiles.ts           # Profile logic helpers
│   │   ├── types.ts              # Global TS interfaces
│   │   └── utils.ts              # Tailwind/general utility functions
│   ├── store/                    # Zustand Global Stores
│   │   ├── useBudgetStore.ts
│   │   ├── useProfileStore.ts
│   │   ├── useRecurringStore.ts
│   │   ├── useTransactionStore.ts
│   │   └── useUIStore.ts
│   └── middleware.ts             # Next.js Edge Middleware for routing
├── .env                          # Environment variables
├── .env.local                    # Local environment overrides
├── .eslintrc.json                # ESLint configuration
├── .gitignore                    # Git ignored files
├── check-db.js                   # Script to check database status
├── next-env.d.ts                 # Next.js TypeScript definitions
├── next.config.mjs               # Next.js configuration
├── package-lock.json             # NPM dependency tree lock
├── package.json                  # NPM dependencies and scripts
├── postcss.config.mjs            # PostCSS configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── test-api.js                   # Script for testing API endpoints
└── tsconfig.json                 # TypeScript configuration
```

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed along with a package manager (`npm`, `yarn`, `pnpm`, or `bun`).

### Installation

1. **Clone the repository** (if applicable):
   ```bash
   git clone <your-repo-url>
   cd expense-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   Configure your database environment variable in the `.env` file, then run Prisma migrations to initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🚀 Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new). Make sure to set your Environment Variables (like `DATABASE_URL` and `NEXTAUTH_SECRET`) in your deployment dashboard. For more details, check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
