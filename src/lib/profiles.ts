import { PROFILE_TYPES, ProfileType } from "./profile-types";

export { PROFILE_TYPES };
export type { ProfileType };

export function getProfileType(type: string) {
  return PROFILE_TYPES.find((p) => p.type === type);
}

export function getProfileIcon(type: string): string {
  return getProfileType(type)?.icon ?? "Wallet";
}

export function getProfileEmoji(type: string): string {
  return getProfileType(type)?.emoji ?? "💰";
}

export function getProfileColor(type: string): string {
  return getProfileType(type)?.color ?? "#7C3AED";
}
