import { Metadata } from "next";
import { ProfileClient } from "./ProfileClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Profile | ExpenseTracker",
  description: "Manage your user profile and transactions.",
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/sign-in");
  }
  
  return <ProfileClient />;
}
