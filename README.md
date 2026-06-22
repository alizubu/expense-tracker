# Personal Expense Tracker 💳

A premium, modern, full-stack Personal Expense Tracker built with **Next.js 14 (App Router)**, **Prisma**, **NextAuth**, and **Tailwind CSS**. Designed with an obsessive focus on UI/UX, the application allows users to effortlessly manage their finances, track transactions, and visualize their spending habits with beautiful interactive charts and micro-animations.

---

## 🚀 Features

- **Premium UI/UX Design**: A stunning $50,000-level mobile-first interface. Features glassmorphism, floating bottom navigation with safe-area support, custom animated pills, and fluid micro-interactions powered by Framer Motion.
- **Authentication & Security**: Secure sign-in, sign-up, and session management using NextAuth.js. Comprehensive security hardening including robust input validation, route protection, and sanitized endpoints.
- **Interactive Dashboard Overview**: Get a quick, beautiful glance at your net balance, recent transactions, and spending summaries. 
- **Multi-Profile Architecture**: Create and manage multiple financial profiles (e.g., Personal, Business, Savings) to keep distinct ledgers cleanly organized.
- **Advanced Transaction Management**: 
  - Add, edit, and organize individual transactions seamlessly.
  - Granular control over Income, Expenses, and cross-profile Transfers.
  - Category-themed UI elements (custom colors and icons for Groceries, Gaming, Travel, etc.).
- **Interactive Analytics**: Visualize your spending habits through category donuts, daily line charts, and monthly bar charts powered by Recharts.
- **Dark Mode Optimized**: Built ground-up for dark mode with curated HSL color palettes, subtle inner shadows, and glowing accent rings.

---

## 🛠 Tech Stack

- **Core Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Client-side global stores)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [MagicUI](https://magicui.design/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

---

## 📂 Detailed Project File Structure

```text
expense-tracker/
├── prisma/
│   └── schema.prisma             # Database schema, models, and relations
├── src/
│   ├── app/                      # Next.js App Router (Pages & API)
│   │   ├── (auth)/               # Route Group: Authentication
│   │   │   ├── sign-in/page.tsx  # User Sign-in page
│   │   │   └── sign-up/page.tsx  # User Registration page
│   │   ├── (dashboard)/          # Route Group: Authenticated App
│   │   │   ├── analytics/page.tsx# Full analytics & charts view
│   │   │   ├── profiles/         # Profile management & dynamic details
│   │   │   │   ├── [id]/page.tsx # Dynamic profile detail view
│   │   │   │   └── page.tsx      # Profile listing page
│   │   │   ├── settings/page.tsx # User & app settings
│   │   │   ├── transactions/page.tsx # Comprehensive transaction timeline
│   │   │   ├── DashboardPage.tsx # Core dashboard overview component
│   │   │   ├── layout.tsx        # Protected dashboard shell (Topbar/Sidebar)
│   │   │   └── page.tsx          # Core dashboard overview page
│   │   ├── api/                  # Backend API endpoints
│   │   │   ├── auth/[...nextauth]/route.ts  # NextAuth handlers
│   │   │   ├── dashboard/route.ts           # Aggregated dashboard stats
│   │   │   ├── profiles/route.ts            # Profile CRUD operations
│   │   │   ├── register/route.ts            # Account creation logic
│   │   │   ├── transactions/route.ts        # Transaction CRUD operations
│   │   │   └── user/route.ts                # User data retrieval
│   │   ├── fonts/                # Local font assets (Geist & GeistMono)
│   │   ├── onboarding/page.tsx   # User Onboarding page
│   │   ├── error.tsx             # Global error boundary
│   │   ├── globals.css           # Global Tailwind directives & custom keyframes
│   │   ├── layout.tsx            # Root application layout & provider wrapping
│   │   └── loading.tsx           # Global loading state
│   ├── components/               # Reusable React UI Components
│   │   ├── analytics/            # Recharts implementations (Donut, Bar, Line)
│   │   ├── dashboard/            # Dashboard-specific widgets (QuickStats, TransactionFeed)
│   │   ├── layout/               # Shell components (MobileNav, Sidebar, Topbar)
│   │   ├── magicui/              # High-end animated micro-components (BlurFade, Meteors)
│   │   ├── pages/                # Page-level components
│   │   ├── profiles/             # Modals and forms for Profile manipulation
│   │   ├── providers/            # React Context providers (Theme, NextAuth)
│   │   ├── transactions/         # Modals, Grids, and Forms for Transactions
│   │   └── ui/                   # Reusable base UI primitives (Button, Card, Input)
│   ├── lib/                      # Helper Utilities & Core Configs
│   │   ├── auth.ts               # NextAuth configuration options
│   │   ├── categories.ts         # Master list of transaction categories and meta
│   │   ├── currencies.ts         # Supported global currency symbols
│   │   ├── formatters.ts         # Number and Date formatting helpers
│   │   ├── prisma.ts             # Global Prisma Client singleton
│   │   └── utils.ts              # Tailwind class merging (cn)
│   ├── store/                    # Zustand Stores (Client State)
│   │   ├── useProfileStore.ts    # Manages loaded profiles
│   │   ├── useTransactionStore.ts# Manages transactions, filtering, and sorting
│   │   └── useUIStore.ts         # Manages global modals, sidebar state, and currency
│   └── middleware.ts             # Edge Middleware for auth route protection
├── .env.local                    # Local environment variables (Auth secrets, DB URL)
├── next.config.mjs               # Next.js configuration & compiler options
├── tailwind.config.ts            # Tailwind theme, colors, and custom animations
└── tsconfig.json                 # TypeScript compiler configuration
```

---

## 🔐 Environment Variables

To run this project locally, you will need to add the following environment variables to your `.env` or `.env.local` file:

```env
# Database configuration
DATABASE_URL="your_database_connection_string"

# NextAuth configuration
NEXTAUTH_SECRET="your_generated_random_secret_string"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+ recommended) installed along with `npm`.

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd expense-tracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up the database**:
   Configure your `DATABASE_URL` in the `.env` file, then run Prisma to sync the schema to your database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Deployment

This application is fully optimized for deployment on [Vercel](https://vercel.com/new). 

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. Add your `DATABASE_URL` and `NEXTAUTH_SECRET` environment variables in the Vercel dashboard.
4. Deploy! Vercel will automatically run `prisma generate && next build` as configured in the `package.json` build script.
