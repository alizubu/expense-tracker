"use client";

import { useEffect } from "react";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-100px)] w-full flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-expense/10">
        <AlertCircle className="h-10 w-10 text-expense" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-text-primary tracking-heading">Something went wrong!</h2>
      <p className="mb-8 max-w-md text-text-muted">
        We encountered an unexpected error while trying to load this page. Our team has been notified.
      </p>
      <ShimmerButton onClick={() => reset()}>
        Try again
      </ShimmerButton>
    </div>
  );
}
