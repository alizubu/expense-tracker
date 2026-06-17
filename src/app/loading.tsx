export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/[0.1] border-t-brand-purple" />
        <p className="text-sm font-medium text-text-muted animate-pulse">Loading data...</p>
      </div>
    </div>
  );
}
