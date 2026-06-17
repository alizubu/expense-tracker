import { create } from "zustand";

interface UIState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  selectedCurrency: string;
  selectedProfileId: string | null;
  selectedMonth: number;
  selectedYear: number;
  searchQuery: string;
  // Actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (modal: string) => void;
  closeModal: () => void;
  setCurrency: (currency: string) => void;
  setSelectedProfile: (profileId: string | null) => void;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  setSearchQuery: (query: string) => void;
}

const now = new Date();

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activeModal: null,
  selectedCurrency: "BDT",
  selectedProfileId: null,
  selectedMonth: now.getMonth() + 1,
  selectedYear: now.getFullYear(),
  searchQuery: "",

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),
  setCurrency: (currency) => set({ selectedCurrency: currency }),
  setSelectedProfile: (profileId) => set({ selectedProfileId: profileId }),
  setSelectedMonth: (month) => set({ selectedMonth: month }),
  setSelectedYear: (year) => set({ selectedYear: year }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
