import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DashboardStatsCards } from "@/components/ui/dashboard-stats";
import { GuardDeploymentMap } from "@/components/ui/guard-deployment-map";
import { ActivityTimeline } from "@/components/ui/activity-timeline";
import { StaffPerformanceTable } from "@/components/ui/staff-performance-table";
import { UpcomingShifts } from "@/components/ui/upcoming-shifts";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  // Fetch dashboard stats
  const { 
    data: dashboardStats, 
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Fetch guard deployment map data
  const { 
    data: guardLocations, 
    isLoading: isLoadingMap,
    error: mapError
  } = useQuery({
    queryKey: ["/api/dashboard/map"],
  });

  // Fetch recent activities
  const { 
    data: recentActivities, 
    isLoading: isLoadingActivities,
    error: activitiesError
  } = useQuery({
    queryKey: ["/api/dashboard/activities"],
  });

  // Fetch staff performance
  const { 
    data: staffPerformance, 
    isLoading: isLoadingPerformance,
    error: performanceError
  } = useQuery({
    queryKey: ["/api/dashboard/performance"],
  });

  // Fetch upcoming shifts
  const { 
    data: upcomingShifts, 
    isLoading: isLoadingShifts,
    error: shiftsError
  } = useQuery({
    queryKey: ["/api/dashboard/shifts"],
  });

  // Handle "View All" actions
  const handleViewAllSchedules = () => {
    setLocation("/schedules");
  };

  const handleViewAllActivities = () => {
    setLocation("/incidents");
  };

  return (
    <DashboardLayout title="Dashboard">
      {/* Dashboard Stats */}
      <DashboardStatsCards
        data={dashboardStats}
        isLoading={isLoadingStats}
        error={statsError as Error}
      />
      
      {/* Guard Deployment Map and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <GuardDeploymentMap
            guardLocations={guardLocations}
            isLoading={isLoadingMap}
            error={mapError as Error}
          />
        </div>
        
        <div>
          <ActivityTimeline
            activities={recentActivities}
            isLoading={isLoadingActivities}
            error={activitiesError as Error}
            onViewAll={handleViewAllActivities}
          />
        </div>
      </div>
      
      {/* Staff Performance and Upcoming Shifts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StaffPerformanceTable
            data={staffPerformance}
            isLoading={isLoadingPerformance}
            error={performanceError as Error}
          />
        </div>
        
        <div>
          <UpcomingShifts
            shifts={upcomingShifts}
            isLoading={isLoadingShifts}
            error={shiftsError as Error}
            onViewAllClick={handleViewAllSchedules}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
