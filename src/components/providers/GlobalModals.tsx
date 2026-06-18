"use client";

import { useUIStore } from "@/store/useUIStore";
import { AddTransactionModal } from "@/components/transactions/AddTransactionModal";

export function GlobalModals() {
  const { activeModal, closeModal } = useUIStore();

  return (
    <>
      {activeModal === "addTransaction" && (
        <AddTransactionModal onClose={closeModal} />
      )}
    </>
  );
}
