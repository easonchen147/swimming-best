import { Card } from "@/components/ui/card";

export function LoadingState({ label }: { label: string }) {
  return (
    <Card className="animate-pulse">
      <div className="font-mono text-xs uppercase tracking-[0.22em] text-primary/55">
        {label}
      </div>
      <div className="mt-4 h-6 w-1/2 rounded-full bg-primary/10" />
      <div className="mt-3 h-4 w-full rounded-full bg-primary/8" />
      <div className="mt-2 h-4 w-3/4 rounded-full bg-primary/8" />
    </Card>
  );
}

