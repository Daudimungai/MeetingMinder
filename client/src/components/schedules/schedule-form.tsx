import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";

// Form schema for schedules
const scheduleFormSchema = z.object({
  guardId: z.string().min(1, { message: "Guard is required" }),
  locationId: z.string().min(1, { message: "Location is required" }),
  shiftId: z.string().min(1, { message: "Shift is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  status: z.string().default("scheduled"),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

export function ScheduleForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get guards for dropdown
  const { data: guards, isLoading: isLoadingGuards, isError: isErrorGuards } = useQuery({
    queryKey: ["/api/guards"],
    staleTime: Infinity,
  });

  // Get locations for dropdown
  const { data: locations, isLoading: isLoadingLocations, isError: isErrorLocations } = useQuery({
    queryKey: ["/api/locations"],
    staleTime: Infinity,
  });

  // Get shifts for dropdown
  const { data: shifts, isLoading: isLoadingShifts, isError: isErrorShifts } = useQuery({
    queryKey: ["/api/shifts"],
    staleTime: Infinity,
  });

  // Form with default values
  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      guardId: "",
      locationId: "",
      shiftId: "",
      date: new Date().toISOString().split('T')[0],
      status: "scheduled",
    },
  });

  // Create schedule mutation
  const createSchedule = useMutation({
    mutationFn: async (values: ScheduleFormValues) => {
      const payload = {
        ...values,
        guardId: parseInt(values.guardId),
        locationId: parseInt(values.locationId),
        shiftId: parseInt(values.shiftId),
      };
      
      const res = await apiRequest("POST", "/api/schedules", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Schedule created",
        description: "The schedule has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      setLocation("/schedules");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create schedule: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submit handler
  const onSubmit = (values: ScheduleFormValues) => {
    createSchedule.mutate(values);
  };

  // Check if we're having issues with data loading
  const isDataError = isErrorGuards || isErrorLocations || isErrorShifts;
  const isDataLoading = isLoadingGuards || isLoadingLocations || isLoadingShifts;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {isDataError ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-500">Failed to load required data</h3>
            <p className="mt-2 text-neutral-600">We couldn't load the necessary information to create a schedule.</p>
          </div>
        ) : isDataLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="guardId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guard</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select guard" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {guards?.map((guard) => {
                            const fullName = `${guard.user?.firstName || ''} ${guard.user?.lastName || ''}`.trim();
                            return (
                              <SelectItem key={guard.id} value={guard.id.toString()}>
                                {fullName} ({guard.guardId})
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations?.map((location) => (
                            <SelectItem key={location.id} value={location.id.toString()}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shiftId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select shift" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {shifts?.map((shift) => (
                            <SelectItem key={shift.id} value={shift.id.toString()}>
                              {shift.name} ({shift.startTime} - {shift.endTime})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="missed">Missed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => setLocation("/schedules")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createSchedule.isPending}>
                  {createSchedule.isPending ? "Creating..." : "Create Schedule"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
