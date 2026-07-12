"use client";
import { TypographySpan } from "@/components/ui/typography";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ArrowRightLeft, Users, BarChart3, Settings } from "lucide-react";

const routes = [
  { icon: LayoutDashboard, href: "/", label: "Dash" },
  { icon: ArrowRightLeft, href: "/transactions", label: "Transact" },
  { icon: Users, href: "/profiles", label: "Wallets" },
  { icon: BarChart3, href: "/analytics", label: "Stats" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-50 pb-safe pointer-events-none">
      <div className="flex items-center justify-around h-14 px-2 bg-surface-1/60 backdrop-blur-3xl border border-white/[0.08] shadow-2xl rounded-full pointer-events-auto relative overflow-hidden">
        {/* Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none" />
        
        {routes.map((route) => {
          const isActive = route.href === "/" 
            ? pathname === "/" 
            : pathname.startsWith(route.href);

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 relative group",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute -top-1 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_12px_rgba(var(--primary),0.8)]" />
              )}
              <route.icon className={cn("w-5 h-5 transition-transform duration-300", isActive && "drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]")} />
              <TypographySpan className={cn("text-[9px] font-bold tracking-wide transition-all", isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100 absolute -bottom-4 group-hover:bottom-1")}>
                {isActive ? route.label : ""}
              </TypographySpan>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
