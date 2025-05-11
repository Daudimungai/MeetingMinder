import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "@shared/types";
import { formatPercentage } from "@/lib/utils";
import { 
  UsersRound, 
  Building2, 
  AlertTriangle, 
  CheckCircle2
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeDirection?: "up" | "down" | "none";
  changeText?: string;
  icon: React.ReactNode;
  iconBgClass: string;
  iconTextClass: string;
}

const StatCard = ({
  title,
  value,
  change,
  changeDirection = "none",
  changeText,
  icon,
  iconBgClass,
  iconTextClass,
}: StatCardProps) => {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex justify-between">
          <div>
            <p className="text-neutral-500 text-sm font-medium">{title}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${iconBgClass}`}>
            <div className={`h-6 w-6 ${iconTextClass}`}>{icon}</div>
          </div>
        </div>
        {(change || changeText) && (
          <div className="flex items-center mt-4">
            {change && (
              <span className={`flex items-center text-sm font-medium ${
                changeDirection === "up" ? "text-green-500" : 
                changeDirection === "down" ? "text-red-500" : 
                "text-neutral-500"
              }`}>
                {changeDirection === "up" && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                )}
                {changeDirection === "down" && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                {change}
              </span>
            )}
            {changeText && (
              <span className="text-neutral-500 text-sm ml-2">{changeText}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  data?: DashboardStats;
  isLoading?: boolean;
  error?: Error | null;
}

export function DashboardStatsCards({ data, isLoading, error }: DashboardStatsProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex justify-between">
                <div>
                  <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse"></div>
                  <div className="h-8 w-12 bg-neutral-200 rounded animate-pulse mt-2"></div>
                </div>
                <div className="h-12 w-12 bg-neutral-200 rounded-full animate-pulse"></div>
              </div>
              <div className="flex items-center mt-4">
                <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="col-span-full">
          <CardContent className="p-5 text-center text-red-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Failed to load dashboard statistics</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default state with empty data
  if (!data) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total Guards"
          value="--"
          icon={<UsersRound />}
          iconBgClass="bg-primary-100"
          iconTextClass="text-primary-700"
        />
        <StatCard
          title="Active Clients"
          value="--"
          icon={<Building2 />}
          iconBgClass="bg-secondary-100"
          iconTextClass="text-secondary-700"
        />
        <StatCard
          title="Pending Reports"
          value="--"
          icon={<AlertTriangle />}
          iconBgClass="bg-amber-100"
          iconTextClass="text-amber-600"
        />
        <StatCard
          title="Attendance Rate"
          value="--"
          icon={<CheckCircle2 />}
          iconBgClass="bg-green-100"
          iconTextClass="text-green-600"
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard
        title="Total Guards"
        value={data.totalGuards}
        change="7%"
        changeDirection="up"
        changeText="from last month"
        icon={<UsersRound />}
        iconBgClass="bg-primary-100"
        iconTextClass="text-primary-700"
      />
      <StatCard
        title="Active Clients"
        value={data.activeClients}
        change="12%"
        changeDirection="up"
        changeText="from last month"
        icon={<Building2 />}
        iconBgClass="bg-secondary-100"
        iconTextClass="text-secondary-700"
      />
      <StatCard
        title="Pending Reports"
        value={data.pendingReports}
        change="3"
        changeDirection="down"
        changeText="need urgent review"
        icon={<AlertTriangle />}
        iconBgClass="bg-amber-100"
        iconTextClass="text-amber-600"
      />
      <StatCard
        title="Attendance Rate"
        value={formatPercentage(data.attendanceRate, 1)}
        change="1.2%"
        changeDirection="up"
        changeText="from last week"
        icon={<CheckCircle2 />}
        iconBgClass="bg-green-100"
        iconTextClass="text-green-600"
      />
    </div>
  );
}
