import { create } from "zustand";
import { Profile } from "@/lib/types";
import { MOCK_PROFILES } from "@/lib/mock-data";
import { generateId } from "@/lib/utils";

interface ProfileState {
  profiles: Profile[];
  activeProfileId: string | null;
  isLoading: boolean;
  // Actions
  addProfile: (profile: Omit<Profile, "id" | "createdAt">) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string | null) => void;
  reorderProfiles: (fromIndex: number, toIndex: number) => void;
  updateBalance: (profileId: string, amount: number) => void;
  getProfile: (id: string) => Profile | undefined;
  getTotalBalance: () => number;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: MOCK_PROFILES,
  activeProfileId: null,
  isLoading: false,

  addProfile: (profile) => {
    const newProfile: Profile = {
      ...profile,
      id: `profile_${generateId()}`,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      profiles: [...state.profiles, newProfile],
    }));
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
