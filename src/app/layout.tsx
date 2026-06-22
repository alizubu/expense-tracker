import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#08080f',
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    default: "ExpenseTracker — The Vault Ledger",
    template: "%s | ExpenseTracker",
  },
  description:
    "A precision personal finance dashboard.",
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
import { HeroUIProvider } from "@/components/providers/HeroUIProvider";
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
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col no-select`}
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
          <HeroUIProvider>
            <AuthProvider>
              <PageTransitionProvider>
                {children}
              </PageTransitionProvider>
              <GlobalModals />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  className: "dark:bg-[var(--bg-surface)] dark:text-[var(--text-primary)] dark:border-white/10 bg-white text-slate-900 border-slate-200",
                }}
              />
            </AuthProvider>
          </HeroUIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
