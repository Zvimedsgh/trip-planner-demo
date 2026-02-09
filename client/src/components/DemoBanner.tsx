import { AlertCircle, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function DemoBanner() {
  const { data: demoStatus } = trpc.demo.getStatus.useQuery(undefined, {
    refetchInterval: 60000, // Refetch every minute
  });

  if (!demoStatus?.isDemoUser || demoStatus.daysRemaining === null) {
    return null;
  }

  const isExpiringSoon = demoStatus.daysRemaining <= 1;
  const isExpired = demoStatus.isExpired;

  if (isExpired) {
    return (
      <div className="bg-destructive text-destructive-foreground px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium">
        <AlertCircle className="h-4 w-4" />
        <span>Your demo has expired. Please upgrade to continue using Trip Planner Pro.</span>
      </div>
    );
  }

  return (
    <div 
      className={`px-4 py-3 flex items-center justify-center gap-2 text-sm font-medium ${
        isExpiringSoon 
          ? 'bg-destructive text-destructive-foreground' 
          : 'bg-amber-500 text-white'
      }`}
    >
      <Clock className="h-4 w-4" />
      <span>
        Demo Mode - {demoStatus.daysRemaining} {demoStatus.daysRemaining === 1 ? 'day' : 'days'} remaining
      </span>
    </div>
  );
}
