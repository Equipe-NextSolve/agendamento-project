import { cn } from "@/lib/cn";

export function Card({ children, className = "" }) {
  return (
    <section
      className={cn(
        "flex w-full flex-col gap-4 rounded-2xl border border-bluelight/20 bg-white shadow-sm",
        className,
      )}
    >
      <div className="h-4" />
      <div className="flex w-full gap-4">
        <div className="w-4 shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-4">{children}</div>
        <div className="w-4 shrink-0" />
      </div>
      <div className="h-4" />
    </section>
  );
}
