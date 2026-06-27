"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, ArrowRightLeft, Users, BarChart3, Settings, UserCircle } from "lucide-react";

const routes = [
  { icon: LayoutDashboard, href: "/", label: "Dash" },
  { icon: ArrowRightLeft, href: "/transactions", label: "Transact" },
  { icon: Users, href: "/profiles", label: "Profiles" },
  { icon: BarChart3, href: "/analytics", label: "Stats" },
  { icon: UserCircle, href: "/profile", label: "Profile" },
  { icon: Settings, href: "/settings", label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 w-full glass border-t border-border/50 z-50 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {routes.map((route) => {
          const isActive = route.href === "/" 
            ? pathname === "/" 
            : pathname.startsWith(route.href);

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
              )}
              <route.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{route.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
