import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentActivity } from "@shared/types";
import { AlertTriangle, CheckCircle, FileText, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
  activities?: RecentActivity[];
  isLoading?: boolean;
  error?: Error | null;
  title?: string;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export function ActivityTimeline({
  activities,
  isLoading,
  error,
  title = "Recent Activity",
  showViewAll = true,
  onViewAll,
}: ActivityTimelineProps) {
  // Get icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "incident":
        return (
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center ring-8 ring-white">
            <AlertTriangle className="h-5 w-5 text-primary-700" />
          </div>
        );
      case "shift_completed":
        return (
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center ring-8 ring-white">
            <CheckCircle className="h-5 w-5 text-green-700" />
          </div>
        );
      case "new_contract":
        return (
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center ring-8 ring-white">
            <FileText className="h-5 w-5 text-blue-700" />
          </div>
        );
      case "guard_assigned":
        return (
          <div className="h-10 w-10 rounded-full bg-secondary-100 flex items-center justify-center ring-8 ring-white">
            <User className="h-5 w-5 text-secondary-700" />
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center ring-8 ring-white">
            <span className="text-lg text-neutral-700">?</span>
          </div>
        );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="h-10 w-10 rounded-full bg-neutral-200 animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-16 bg-neutral-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-full bg-neutral-200 rounded animate-pulse"></div>
                </div>
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
        <CardHeader className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-red-500">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>Failed to load activities</p>
        </CardContent>
      </Card>
    );
  }

  // Default with empty data
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-neutral-500">
          <p>No recent activities</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {showViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-primary-600 hover:text-primary-800"
          >
            View all
          </button>
        )}
      </CardHeader>
      <CardContent className="p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, index) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {index < activities.length - 1 && (
                    <span
                      className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-neutral-200"
                      aria-hidden="true"
                    ></span>
                  )}
                  <div className="relative flex items-start space-x-3">
                    <div className="relative">{getActivityIcon(activity.type)}</div>
                    <div className="min-w-0 flex-1">
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          {activity.title}
                        </div>
                        <p className="mt-0.5 text-sm text-neutral-500">{activity.timeAgo}</p>
                      </div>
                      <div className="mt-2 text-sm text-neutral-700">
                        <p>{activity.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
