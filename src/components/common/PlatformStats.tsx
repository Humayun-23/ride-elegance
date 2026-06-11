import { usePlatformStats } from "@/features/statistics/hooks/usePlatformStats";
import { Skeleton } from "@/components/ui/skeleton";

type PlatformStatsProps = {
  variant?: "desktop" | "mobile";
};

export function PlatformStats({ variant = "desktop" }: PlatformStatsProps) {
  const { data, isLoading, isError } = usePlatformStats();

  if (isError) {
    return null; // hide on error silently
  }

  const isMobile = variant === "mobile";

  // Handle loading state with Skeleton
  if (isLoading) {
    return (
      <div className={`grid grid-cols-3 gap-2 ${isMobile ? "w-full" : "max-w-xl"}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`flex flex-col items-center justify-center rounded-2xl bg-white/50 border border-border/50 shadow-sm ${isMobile ? "p-3" : "py-4 px-3"}`}>
            <Skeleton className="h-6 w-10 mb-1.5" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const { total_shops, total_vehicles, total_bookings } = data;

  // Zero handling logic: If everything is zero, hide section completely.
  if (total_shops === 0 && total_vehicles === 0 && total_bookings === 0) {
    return null;
  }

  const stats = [
    {
      label: isMobile ? "Shops" : "Verified Shops",
      value: total_shops,
      format: (v: number) => (v <= 0 ? "Onboarding" : `${v}+`),
    },
    {
      label: isMobile ? "Vehicles" : "Listed Vehicles",
      value: total_vehicles,
      format: (v: number) => (v <= 0 ? "Onboarding" : `${v}+`),
    },
    {
      label: isMobile ? "Bookings" : "Bookings Assisted",
      value: total_bookings,
      format: (v: number) => (v <= 0 ? "New" : `${v}+`),
    },
  ];

  return (
    <div className={`grid grid-cols-3 gap-2 ${isMobile ? "w-full" : "max-w-xl"}`}>
      {stats.map((stat, i) => (
        <div 
          key={i} 
          className={`flex flex-col items-center justify-center rounded-2xl bg-white border border-border/70 shadow-sm transition-transform hover:-translate-y-0.5 ${
            isMobile ? "p-3" : "py-4 px-3"
          }`}
        >
          <span className={`font-display font-bold text-foreground ${isMobile ? "text-lg" : "text-2xl"}`}>
            {stat.format(stat.value)}
          </span>
          <span className={`text-muted-foreground uppercase tracking-wider text-center mt-1 ${isMobile ? "text-[9px]" : "text-[11px]"}`}>
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
