"use client"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, ArrowLeftRight, Plus, Users, BarChart2 } from "lucide-react"
import { useState } from "react"
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal"

const NAV_ITEMS = [
  { label: "Dashboard",    icon: LayoutDashboard,  href: "/"              },
  { label: "Transactions", icon: ArrowLeftRight,   href: "/transactions"  },
  { label: "ADD",          icon: Plus,             href: null             }, // center button
  { label: "Profiles",     icon: Users,            href: "/profiles"      },
  { label: "Analytics",    icon: BarChart2,        href: "/analytics"     },
]

export function MobileNav() {
  const pathname  = usePathname()
  const router    = useRouter()
  const [showAdd, setShowAdd] = useState(false)

  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Pill nav bar */}
        <div className="mx-3 mb-2.5 rounded-[24px] border border-border
                        bg-card/95 backdrop-blur-2xl
                        shadow-[0_-1px_0_rgba(255,255,255,0.05)_inset,0_8px_32px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-5 h-[62px] px-1 items-center">
            {NAV_ITEMS.map((item, index) => {
              if (item.href === null) {
                // Center ADD button
                return (
                  <div key="add" className="flex justify-center">
                    <div className="relative -top-3.5">
                      {/* Spinning glow ring */}
                      <motion.div
                        className="absolute inset-[-4px] rounded-full"
                        style={{
                          background: 'conic-gradient(from 0deg, rgba(124,58,237,0.6), rgba(167,139,250,0.3), rgba(79,70,229,0.6), rgba(124,58,237,0.6))',
                          filter: 'blur(4px)',
                        }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      />
                      {/* Pulse ring */}
                      <motion.div
                        className="absolute inset-[-4px] rounded-full border border-accent/50"
                        animate={{ scale: [1, 1.3, 1.3], opacity: [0.8, 0, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeOut' }}
                      />
                      {/* Button */}
                      <motion.button
                        onClick={() => setShowAdd(true)}
                        whileTap={{ scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        className="relative z-10 w-[52px] h-[52px] rounded-full
                                   bg-gradient-to-br from-violet-600 via-violet-700 to-indigo-700
                                   border-[2px] border-violet-400/40 flex items-center justify-center
                                   shadow-[0_0_0_4px_var(--bg-surface),0_0_20px_rgba(124,58,237,0.6),0_4px_16px_rgba(0,0,0,0.5)] cursor-pointer"
                      >
                        <Plus size={22} strokeWidth={2.5} className="text-white" />
                      </motion.button>
                    </div>
                  </div>
                )
              }

              const isActive = pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))
              const Icon = item.icon

              return (
                <motion.button
                  key={item.href}
                  onClick={() => router.push(item.href!)}
                  className="flex flex-col items-center gap-[3px] py-2 relative
                             min-h-[44px] justify-center cursor-pointer"
                  whileTap={{ scale: 0.88 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {/* Sliding background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-bg"
                      className="absolute w-10 h-8 rounded-xl
                                 bg-accent-dim border border-accent/20"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}

                  {/* Icon */}
                  <motion.div
                    animate={{ scale: isActive ? 1 : 0.95 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                    className="relative z-10"
                  >
                    <Icon
                      size={20}
                      className={isActive ? 'text-accent' : 'text-text-muted'}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                  </motion.div>

                  {/* Label */}
                  <span className={`text-[10px] relative z-10 transition-colors duration-200
                    ${isActive ? 'text-accent font-semibold' : 'text-text-muted'}`}>
                    {item.label}
                  </span>

                  {/* Active dot indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-dot"
                      className="absolute bottom-1 w-1 h-1 rounded-full bg-accent"
                      style={{
                        boxShadow: '0 0 6px var(--accent-color), 0 0 12px var(--accent-color)'
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Safe area fill */}
        <div className="mx-3 bg-card rounded-b-[20px]"
             style={{ height: 'env(safe-area-inset-bottom)' }} />
      </div>

      {/* Add Transaction Bottom Sheet */}
      <AnimatePresence>
        {showAdd && <AddTransactionModal onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </>
  )
}
