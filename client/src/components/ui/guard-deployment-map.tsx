import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GuardLocation } from "@shared/types";
import { MapPin, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { statusColorMap } from "@/lib/utils";

interface GuardDeploymentMapProps {
  guardLocations?: GuardLocation[];
  isLoading?: boolean;
  error?: Error | null;
  title?: string;
}

export function GuardDeploymentMap({
  guardLocations,
  isLoading,
  error,
  title = "Guard Deployment",
}: GuardDeploymentMapProps) {
  const [counts, setCounts] = useState({
    onDuty: 0,
    lateCheckIn: 0,
    incidentReported: 0,
  });

  useEffect(() => {
    if (guardLocations) {
      const onDuty = guardLocations.filter(loc => loc.status === "on-duty").length;
      const lateCheckIn = guardLocations.filter(loc => loc.status === "late-check-in").length;
      const incidentReported = guardLocations.filter(loc => loc.status === "incident-reported").length;
      
      setCounts({ onDuty, lateCheckIn, incidentReported });
    }
  }, [guardLocations]);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-6 py-4 border-b border-neutral-200">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-[400px] bg-neutral-200 rounded-lg animate-pulse"></div>
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
          <p>Failed to load guard deployment data</p>
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
        <div className="relative h-[400px] bg-neutral-100 rounded-lg overflow-hidden">
          {/* Map Background */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-70"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1580745377298-bc2c578c5b50?q=80&w=1300&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" 
            }}
          ></div>
          <div className="absolute inset-0 bg-primary-900 bg-opacity-20"></div>
          
          {/* Location Markers */}
          {!guardLocations ? (
            // Default placeholder markers when no data
            Array.from({ length: 5 }).map((_, index) => {
              const top = `${20 + (index * 15)}%`;
              const left = `${20 + (index * 12)}%`;
              const status = index % 3 === 0 ? "incident-reported" :
                            index % 2 === 0 ? "late-check-in" : "on-duty";
              const statusColor = status === "on-duty" ? "bg-green-500" :
                                status === "late-check-in" ? "bg-amber-500" : "bg-red-500";
              
              return (
                <div
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ top, left }}
                >
                  <div className="relative">
                    <div className={`h-4 w-4 ${statusColor} rounded-full animate-ping absolute`}></div>
                    <div className={`h-4 w-4 ${statusColor} rounded-full relative`}></div>
                  </div>
                </div>
              );
            })
          ) : (
            // Real data markers
            guardLocations.map((location, index) => {
              const top = `${15 + (location.latitude % 70)}%`;
              const left = `${15 + (location.longitude % 70)}%`;
              const statusColor = location.status === "on-duty" ? "bg-green-500" :
                                location.status === "late-check-in" ? "bg-amber-500" : "bg-red-500";
              
              return (
                <div
                  key={location.id || index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ top, left }}
                >
                  <div className="relative">
                    <div className={`h-4 w-4 ${statusColor} rounded-full animate-ping absolute`}></div>
                    <div className={`h-4 w-4 ${statusColor} rounded-full relative`}></div>
                  </div>
                </div>
              );
            })
          )}
          
          {/* Map Legend */}
          <div className="absolute bottom-4 right-4 bg-white bg-opacity-90 p-3 rounded-md shadow-md">
            <div className="text-sm font-medium mb-2">Status</div>
            <div className="flex items-center mb-1">
              <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs">On Duty ({counts.onDuty || 87})</span>
            </div>
            <div className="flex items-center mb-1">
              <div className="h-3 w-3 bg-amber-500 rounded-full mr-2"></div>
              <span className="text-xs">Late Check-in ({counts.lateCheckIn || 12})</span>
            </div>
            <div className="flex items-center">
              <div className="h-3 w-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-xs">Incident Reported ({counts.incidentReported || 4})</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
