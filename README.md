# Personal Expense Tracker 💳

A premium, modern, full-stack Personal Expense Tracker built with **Next.js 14 (App Router)**, **Prisma**, **NextAuth**, and **Tailwind CSS**. Designed with an obsessive focus on UI/UX, the application allows users to effortlessly manage their finances, track transactions, and visualize their spending habits with beautiful interactive charts and micro-animations.

---

## 🎉 What's New in v4.0

- **Headless UI Migration**: Completely migrated to a combination of [Base UI](https://base-ui.com/) and [Shadcn UI](https://ui.shadcn.com/) for enhanced accessibility, better types, and rock-solid primitive component foundations.
- **Architectural Cleanup**: Removed heavyweight animation libraries (MagicUI) in favor of optimized, custom Framer Motion transitions and Base UI logic, improving layout shift metrics and render speeds.
- **Flawless Type Safety**: Rewritten custom abstractions across forms, modals, and layouts to guarantee zero `tsc` build errors and perfectly typed component hierarchies.

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
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) & [Base UI](https://base-ui.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

---

## 📂 Detailed Project File Structure

```text
expense-tracker/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   │   ├── page.tsx
│   │   │   │   └── SignInPage.tsx
│   │   │   └── sign-up/
│   │   │       ├── page.tsx
│   │   │       └── SignUpPage.tsx
│   │   ├── (dashboard)/
│   │   │   ├── analytics/
│   │   │   │   ├── AnalyticsPage.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── profiles/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── ProfilesPage.tsx
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── ProfileDetailPage.tsx
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx
│   │   │   │   └── SettingsPage.tsx
│   │   │   └── transactions/
│   │   │       ├── page.tsx
│   │   │       └── TransactionsPage.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       ├── nextauthHandler.ts
│   │   │   │       └── route.ts
│   │   │   ├── dashboard/
│   │   │   │   └── route.ts
│   │   │   ├── profiles/
│   │   │   │   └── route.ts
│   │   │   ├── register/
│   │   │   │   └── route.ts
│   │   │   ├── transactions/
│   │   │   │   └── route.ts
│   │   │   └── user/
│   │   │       └── route.ts
│   │   ├── error.tsx
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── onboarding/
│   │       ├── OnboardingPage.tsx
│   │       └── page.tsx
│   ├── components/
│   │   ├── analytics/
│   │   │   ├── AnalyticsStatsRow.tsx
│   │   │   ├── CategoryDonutChart.tsx
│   │   │   ├── DailyLineChart.tsx
│   │   │   ├── MonthlyBarChart.tsx
│   │   │   ├── ProfileAreaChart.tsx
│   │   │   └── TopCategories.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardClient.tsx
│   │   │   ├── ProfileCard.tsx
│   │   │   ├── QuickStats.tsx
│   │   │   ├── SpendingChart.tsx
│   │   │   ├── StatsStrip.tsx
│   │   │   └── TransactionFeed.tsx
│   │   ├── layout/
│   │   │   ├── ClientLayoutWrapper.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   ├── profiles/
│   │   │   ├── CreateProfileModal.tsx
│   │   │   └── EditProfileModal.tsx
│   │   ├── providers/
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── GlobalModals.tsx
│   │   │   ├── PageTransitionProvider.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── transactions/
│   │   │   ├── AccountSelector.tsx
│   │   │   ├── AddTransactionModal.tsx
│   │   │   ├── CategoryGrid.tsx
│   │   │   ├── ConfirmButton.tsx
│   │   │   └── EditTransactionModal.tsx
│   │   └── ui/
│   │       ├── avatar.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── empty-state.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── skeleton.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       └── tooltip.tsx
│   ├── lib/
│   │   ├── audit.ts
│   │   ├── auth.ts
│   │   ├── categories.ts
│   │   ├── currencies.ts
│   │   ├── formatters.ts
│   │   ├── prisma.ts
│   │   ├── profile-types.ts
│   │   ├── profiles.ts
│   │   ├── rate-limit.ts
│   │   ├── security.ts
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── validators.ts
│   ├── middleware.ts
│   └── store/
│       ├── useProfileStore.ts
│       ├── useTransactionStore.ts
│       └── useUIStore.ts
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
