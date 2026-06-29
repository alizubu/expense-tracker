import { TypographyP } from "@/components/ui/typography";
export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-100px)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <TypographyP className="text-sm font-medium text-muted-foreground animate-pulse">Loading data...</TypographyP>
      </div>
    </div>
  );
}
