import { create } from "zustand";
import { Profile } from "@/lib/types";

import { generateId } from "@/lib/utils";

interface ProfileState {
  profiles: Profile[];
  activeProfileId: string | null;
  isLoading: boolean;
  // Actions
  fetchProfiles: () => Promise<void>;
  addProfile: (profile: Omit<Profile, "id" | "createdAt" | "updatedAt" | "userId">) => Promise<void>;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string | null) => void;
  reorderProfiles: (fromIndex: number, toIndex: number) => void;
  updateBalance: (profileId: string, amount: number) => void;
  getProfile: (id: string) => Profile | undefined;
  getTotalBalance: () => number;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  activeProfileId: null,
  isLoading: false,

  fetchProfiles: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/profiles");
      const data = await res.json();
      set({ profiles: Array.isArray(data) ? data : [], isLoading: false });
    } catch (error) {
      console.error(error);
      set({ profiles: [], isLoading: false });
    }
  },

  addProfile: async (profile) => {
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create profile");
      }
      const newProfile = await res.json();
      set((state) => ({ profiles: [...state.profiles, newProfile] }));
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateProfile: (id, updates) => {
    set((state) => ({
      profiles: state.profiles.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  },

  deleteProfile: (id) => {
    set((state) => ({
      profiles: state.profiles.filter((p) => p.id !== id),
    }));
  },

  setActiveProfile: (id) => set({ activeProfileId: id }),

  reorderProfiles: (fromIndex, toIndex) => {
    set((state) => {
      const profiles = [...state.profiles];
      const [removed] = profiles.splice(fromIndex, 1);
      profiles.splice(toIndex, 0, removed);
      return {
        profiles: profiles.map((p, i) => ({ ...p, sortOrder: i })),
      };
    });
  },

  updateBalance: (profileId, amount) => {
    set((state) => ({
      profiles: state.profiles.map((p) =>
        p.id === profileId ? { ...p, balance: p.balance + amount } : p
      ),
    }));
  },

  getProfile: (id) => {
    return get().profiles.find((p) => p.id === id);
  },

  getTotalBalance: () => {
    return get().profiles.reduce((sum, p) => sum + p.balance, 0);
  },
}));
