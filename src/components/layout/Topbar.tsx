"use client";

import { usePathname } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useUIStore } from "@/store/useUIStore";

export function Topbar() {
  const pathname = usePathname();
  const { openModal } = useUIStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    const segment = pathname.split("/")[1];
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : "Overview";
  };

  return (
    <header
      className="sticky top-0 z-50 flex h-[60px] items-center justify-between border-b px-[24px]"
      style={{
        background: "rgba(250, 250, 248, 0.9)",
        backdropFilter: "blur(8px) saturate(1.4)",
        borderBottomColor: "rgba(0,0,0,0.07)",
      }}
    >
      {/* Left: Dynamic Title */}
      <div className="flex flex-col min-w-[120px]">
        <h1 className="text-[15px] font-semibold text-[#111111]">
          {getPageTitle()}
        </h1>
      </div>

      {/* Center: Search */}
      <div className="hidden lg:flex flex-1 justify-center">
        <div className="relative flex items-center w-[340px]">
          <Search className="absolute left-[12px] h-[15px] w-[15px] text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="h-[38px] w-full rounded-[10px] border border-[rgba(0,0,0,0.10)] bg-[#FFFFFF] pl-[36px] pr-[40px] text-[13px] text-[#111111] placeholder:text-[#9CA3AF] transition-all shadow-[0_1px_3px_rgba(0,0,0,0.06)] focus:border-[#7C3AED] focus:outline-none focus:ring-[3px] focus:ring-[rgba(124,58,237,0.10)]"
          />
          <div className="absolute right-[8px] flex items-center justify-center rounded-[5px] bg-[#F3F4F6] px-[5px] py-[1px] text-[11px] font-medium text-[#9CA3AF]">
            ⌘K
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-[8px] min-w-[120px] justify-end">
        <button
          onClick={() => openModal("addTransaction")}
          className="flex h-[36px] items-center justify-center rounded-[9px] bg-[#7C3AED] px-[16px] text-[13px] font-semibold text-white transition-all shadow-[0_1px_4px_rgba(124,58,237,0.3)] hover:bg-[#6D28D9] hover:scale-[0.98]"
        >
          <Plus className="mr-1 h-4 w-4" /> Add
        </button>
        <button
          onClick={() => {
            import("next-auth/react").then(({ signOut }) => signOut());
          }}
          className="flex h-[36px] items-center justify-center rounded-[9px] border border-[rgba(0,0,0,0.10)] bg-transparent px-[12px] text-[13px] font-medium text-[#6B7280] transition-all hover:bg-[#F7F7F5] hover:text-[#111111]"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}
