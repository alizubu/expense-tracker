import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ExpenseTracker — Personal Finance Dashboard",
    template: "%s | ExpenseTracker",
  },
  description:
    "A premium personal expense tracking SaaS. Track income, expenses, transfers across multiple profiles with beautiful analytics and budget management.",
  keywords: [
    "expense tracker",
    "personal finance",
    "budget",
    "money management",
    "income",
    "expense",
  ],
  authors: [{ name: "Your Name" }],
  openGraph: {
    title: "ExpenseTracker — Premium Personal Finance",
    description: "Take control of your finances with advanced analytics, multi-currency support, and beautiful dashboards.",
    url: "https://your-domain.com",
    siteName: "ExpenseTracker",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ExpenseTracker — Premium Personal Finance",
    description: "Take control of your finances with advanced analytics, multi-currency support, and beautiful dashboards.",
  },
};

import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background-primary text-text-primary transition-colors duration-300`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: "dark:bg-[#1C1C27] dark:text-[#F8FAFC] dark:border-white/10 bg-white text-slate-900 border-slate-200",
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
