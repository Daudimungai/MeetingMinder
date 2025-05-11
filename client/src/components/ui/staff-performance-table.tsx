import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StaffPerformance } from "@shared/types";
import { AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInitials, formatPercentage } from "@/lib/utils";
import { useState } from "react";

interface StaffPerformanceTableProps {
  data?: StaffPerformance[];
  isLoading?: boolean;
  error?: Error | null;
  title?: string;
}

export function StaffPerformanceTable({
  data,
  isLoading,
  error,
  title = "Staff Performance"
}: StaffPerformanceTableProps) {
  const [timeRange, setTimeRange] = useState("week");

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <div className="w-32 h-9 bg-neutral-200 animate-pulse rounded"></div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="min-w-full">
            <div className="border-b border-neutral-200 pb-3 mb-3">
              <div className="grid grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 bg-neutral-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="py-3 grid grid-cols-6 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-neutral-200 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse"></div>
                    <div className="h-3 w-16 bg-neutral-200 rounded animate-pulse"></div>
                  </div>
                </div>
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 bg-neutral-200 rounded animate-pulse"></div>
                ))}
              </div>
            ))}
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
          <p>Failed to load staff performance data</p>
        </CardContent>
      </Card>
    );
  }

  // Default with empty data
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <Select defaultValue="week" onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="p-6 text-center text-neutral-500">
          <p>No performance data available</p>
        </CardContent>
      </Card>
    );
  }

  // Helper function to get color based on performance value
  const getPerformanceColor = (value: number) => {
    if (value >= 90) return "bg-green-500";
    if (value >= 75) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <Select defaultValue="week" onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Guard
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Attendance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Incidents
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {data.map((staff) => (
                <tr key={staff.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Avatar>
                          <AvatarImage src={staff.imageUrl} alt={staff.name} />
                          <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900">{staff.name}</div>
                        <div className="text-sm text-neutral-500">ID: {staff.guardId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">{staff.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">{staff.location}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">{formatPercentage(staff.attendance, 0)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-neutral-900">{staff.incidents}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-neutral-200 rounded-full h-2">
                        <div 
                          className={`${getPerformanceColor(staff.performance)} h-2 rounded-full`}
                          style={{ width: `${staff.performance}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-neutral-700">
                        {formatPercentage(staff.performance, 0)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
