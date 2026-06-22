import { Metadata } from "next";
import { UsersClient } from "./UsersClient";

export const metadata: Metadata = {
  title: "Users | ExpenseTracker",
  description: "Manage users, roles, and access.",
};

export default function UsersPage() {
  return <UsersClient />;
}
