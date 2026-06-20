import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0f',
  viewportFit: 'cover',
};

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
import { PageTransitionProvider } from "@/components/providers/PageTransitionProvider";
import { GlobalModals } from "@/components/providers/GlobalModals";

import { headers } from "next/headers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = headers().get("X-Nonce") ?? "";

  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body
        className={`${GeistSans.className} antialiased min-h-screen flex flex-col no-select`}
      >
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Disable right-click context menu
                document.addEventListener('contextmenu', function(e) {
                  e.preventDefault();
                });

                // Disable common devtools keyboard shortcuts
                document.addEventListener('keydown', function(e) {
                  if (e.key === 'F12') { e.preventDefault(); return false; }
                  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') { e.preventDefault(); return false; }
                  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') { e.preventDefault(); return false; }
                  if ((e.ctrlKey || e.metaKey) && e.key === 'u') { e.preventDefault(); return false; }
                  if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); return false; }
                  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') { e.preventDefault(); return false; }
                });

                // Detect DevTools open via window size difference
                var devtools = { open: false };
                var threshold = 160;
                setInterval(function() {
                  if (window.outerWidth - window.innerWidth > threshold ||
                      window.outerHeight - window.innerHeight > threshold) {
                    if (!devtools.open) {
                      devtools.open = true;
                      document.body.innerHTML = '';
                      window.location.href = '/sign-in';
                    }
                  } else {
                    devtools.open = false;
                  }
                }, 1000);
              })();
            `,
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <PageTransitionProvider>
              {children}
            </PageTransitionProvider>
            <GlobalModals />
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
