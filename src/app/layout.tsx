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

import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${inter.variable} font-sans antialiased bg-background-primary text-text-primary`}
        >
          {children}
          <Toaster
            theme="dark"
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1C1C27",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#F8FAFC",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
