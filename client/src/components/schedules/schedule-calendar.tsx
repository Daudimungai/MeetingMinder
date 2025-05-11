import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus 
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isWeekend, isSameDay } from "date-fns";
import { statusColorMap } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export function ScheduleCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedGuard, setSelectedGuard] = useState<string>("all");
  
  // Date formatting helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get guards for filtering
  const { data: guards, isLoading: isLoadingGuards, isError: isErrorGuards } = useQuery({
    queryKey: ["/api/guards"],
    staleTime: Infinity,
  });
  
  // Get schedules for the current month
  const { data: schedules, isLoading: isLoadingSchedules, isError: isErrorSchedules } = useQuery({
    queryKey: ["/api/schedules", { 
      startDate: startOfMonth(currentMonth).toISOString(), 
      endDate: endOfMonth(currentMonth).toISOString() 
    }],
  });
  
  // Filter schedules based on selected guard
  const filteredSchedules = schedules?.filter(schedule => {
    if (selectedGuard === "all") return true;
    return schedule.guardId === parseInt(selectedGuard);
  });
  
  // Navigation functions
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
  };
  
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
  };
  
  // Helper to get schedules for a specific day
  const getSchedulesForDay = (day: Date) => {
    return filteredSchedules?.filter(schedule => 
      isSameDay(new Date(schedule.date), day)
    ) || [];
  };
  
  // Loading state
  const isLoading = isLoadingGuards || isLoadingSchedules;
  const isError = isErrorGuards || isErrorSchedules;
  
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Schedule Calendar</CardTitle>
            <CardDescription>View and manage guard schedules</CardDescription>
          </div>
          <Link href="/schedules/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Schedule
            </Button>
          </Link>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mt-4">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={prevMonth}
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="mx-4 text-xl font-semibold">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              disabled={isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="w-full sm:w-auto">
            <Select 
              value={selectedGuard} 
              onValueChange={setSelectedGuard}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by guard" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Guards</SelectItem>
                {guards?.map((guard) => {
                  const fullName = `${guard.user?.firstName || ''} ${guard.user?.lastName || ''}`.trim();
                  return (
                    <SelectItem key={guard.id} value={guard.id.toString()}>
                      {fullName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isError ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-500">Failed to load schedule data</h3>
            <p className="mt-2 text-neutral-600">Please try again later.</p>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {/* Day names header */}
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div 
                key={day} 
                className="text-center py-2 font-medium text-neutral-500"
              >
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {daysInMonth.map((day) => {
              const daySchedules = getSchedulesForDay(day);
              const isCurrentDay = isToday(day);
              const isInCurrentMonth = isSameMonth(day, currentMonth);
              const isWeekendDay = isWeekend(day);
              
              return (
                <div
                  key={day.toString()}
                  className={`min-h-[120px] border rounded-md p-2 ${
                    !isInCurrentMonth ? 'bg-neutral-50 opacity-50' : 
                    isWeekendDay ? 'bg-neutral-50' : 
                    'bg-white'
                  } ${
                    isCurrentDay ? 'border-primary-500 border-2' : 'border-neutral-200'
                  }`}
                >
                  <div className="text-right mb-1">
                    <span 
                      className={`inline-block w-7 h-7 rounded-full text-center leading-7 ${
                        isCurrentDay 
                          ? 'bg-primary-500 text-white' 
                          : 'text-neutral-700'
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mt-1">
                    {daySchedules.length > 0 ? (
                      daySchedules.slice(0, 3).map((schedule) => (
                        <div 
                          key={schedule.id} 
                          className="flex items-center p-1 bg-neutral-50 rounded text-xs"
                        >
                          {schedule.guard && (
                            <Avatar className="h-5 w-5 mr-1">
                              <AvatarFallback className="text-[8px]">
                                {getInitials(`${schedule.guard.user?.firstName || ''} ${schedule.guard.user?.lastName || ''}`)}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className="flex-1 truncate">
                            {schedule.location?.name || "Unknown"}
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`${statusColorMap[schedule.status || "scheduled"]} ml-1 text-[8px] px-1 py-0`}
                          >
                            {schedule.shift?.name || "Shift"}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-neutral-400 text-center italic">
                        No schedules
                      </div>
                    )}
                    
                    {daySchedules.length > 3 && (
                      <div className="text-xs text-primary-600 text-center">
                        +{daySchedules.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
