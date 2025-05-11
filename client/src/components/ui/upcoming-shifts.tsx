import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpcomingShift } from "@shared/types";
import { AlertTriangle, Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UpcomingShiftsProps {
  shifts?: UpcomingShift[];
  isLoading?: boolean;
  error?: Error | null;
  title?: string;
  onViewAllClick?: () => void;
}

export function UpcomingShifts({
  shifts,
  isLoading,
  error,
  title = "Upcoming Shifts",
  onViewAllClick,
}: UpcomingShiftsProps) {
  // Helper to get badge text and color based on date
  const getDateBadge = (date: string) => {
    const today = new Date().toDateString();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toDateString();
    
    if (date === today) {
      return { text: "Today", className: "bg-green-100 text-green-800" };
    } else if (date === tomorrowStr) {
      return { text: "Tomorrow", className: "bg-amber-100 text-amber-800" };
    } else {
      // Extract just the date part (e.g., "Jun 18")
      const parts = new Date(date).toDateString().split(' ');
      return { 
        text: `${parts[1]} ${parts[2]}`,
        className: "bg-neutral-100 text-neutral-800"
      };
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-6 py-4 border-b border-neutral-200">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-neutral-200 h-32 rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <div className="inline-block h-6 w-40 bg-neutral-200 rounded animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card>
        <CardHeader className="px-6 py-4 border-b border-neutral-200">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-red-500">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>Failed to load upcoming shifts</p>
        </CardContent>
      </Card>
    );
  }

  // Default with empty data
  if (!shifts || shifts.length === 0) {
    return (
      <Card>
        <CardHeader className="px-6 py-4 border-b border-neutral-200">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-neutral-500">
          <p>No upcoming shifts scheduled</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {shifts.map((shift) => {
            const badge = getDateBadge(shift.date);
            
            return (
              <div key={shift.id} className="bg-neutral-50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{shift.location}</h4>
                    <p className="text-sm text-neutral-500 mt-1">{shift.shiftName}</p>
                    <div className="flex items-center mt-2">
                      <Clock className="h-4 w-4 text-neutral-500 mr-1" />
                      <span className="text-xs text-neutral-500">{shift.time}</span>
                    </div>
                    <div className="mt-3 flex -space-x-2">
                      {shift.guards.slice(0, 3).map((guard) => (
                        <Avatar key={guard.id} className="h-6 w-6 border-2 border-white">
                          <AvatarImage 
                            src={guard.imageUrl} 
                            alt={guard.name}
                            className="object-cover"
                          />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(guard.name)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {shift.guards.length > 3 && (
                        <div className="h-6 w-6 rounded-full border-2 border-white flex items-center justify-center bg-neutral-100 text-xs font-medium text-neutral-500">
                          +{shift.guards.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                    {badge.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            variant="link" 
            className="text-sm text-primary-600 hover:text-primary-800 font-medium"
            onClick={onViewAllClick}
          >
            View All Schedules
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
