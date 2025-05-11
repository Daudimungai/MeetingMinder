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
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Upload } from "lucide-react";

// Form schema for incidents
const incidentFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  locationId: z.string().min(1, { message: "Location is required" }),
  categoryId: z.string().min(1, { message: "Category is required" }),
  date: z.string().min(1, { message: "Date is required" }),
  priority: z.string().min(1, { message: "Priority is required" }),
  photos: z.instanceof(FileList).optional(),
});

type IncidentFormValues = z.infer<typeof incidentFormSchema>;

export function IncidentForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get locations for dropdown
  const { data: locations, isLoading: isLoadingLocations, isError: isErrorLocations } = useQuery({
    queryKey: ["/api/locations"],
    staleTime: Infinity,
  });

  // Get incident categories for dropdown
  const { data: categories, isLoading: isLoadingCategories, isError: isErrorCategories } = useQuery({
    queryKey: ["/api/incident-categories"],
    staleTime: Infinity,
  });

  // Form with default values
  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      title: "",
      description: "",
      locationId: "",
      categoryId: "",
      date: new Date().toISOString().split('T')[0],
      priority: "medium",
    },
  });

  // Create incident mutation
  const createIncident = useMutation({
    mutationFn: async (values: IncidentFormValues) => {
      // Create a FormData object for file uploads
      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("description", values.description);
      formData.append("locationId", values.locationId);
      formData.append("categoryId", values.categoryId);
      formData.append("date", values.date);
      formData.append("priority", values.priority);
      
      // Add photos if any
      if (values.photos) {
        for (let i = 0; i < values.photos.length; i++) {
          formData.append("photos", values.photos[i]);
        }
      }
      
      // Custom fetch for FormData
      const response = await fetch("/api/incidents", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || response.statusText);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Incident reported",
        description: "The incident has been successfully reported.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/incidents"] });
      setLocation("/incidents");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to report incident: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submit handler
  const onSubmit = (values: IncidentFormValues) => {
    createIncident.mutate(values);
  };

  // Check if we're having issues with data loading
  const isDataError = isErrorLocations || isErrorCategories;
  const isDataLoading = isLoadingLocations || isLoadingCategories;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Incident</CardTitle>
      </CardHeader>
      <CardContent>
        {isDataError ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-500">Failed to load required data</h3>
            <p className="mt-2 text-neutral-600">We couldn't load the necessary information to report an incident.</p>
          </div>
        ) : isDataLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief title of the incident" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories?.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
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
                
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of what happened" 
                        rows={5}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="photos"
                render={({ field: { value, onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Photos (Optional)</FormLabel>
                    <FormControl>
                      <div className="border-2 border-dashed border-neutral-300 rounded-md p-6 flex flex-col items-center justify-center">
                        <Upload className="h-10 w-10 text-neutral-400 mb-2" />
                        <p className="text-sm text-neutral-600">
                          Drag & drop photos here, or click to select files
                        </p>
                        <p className="text-xs text-neutral-500 mt-1">
                          Upload up to 5 photos (Max 5MB each)
                        </p>
                        <Input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          id="photos-upload"
                          onChange={(e) => onChange(e.target.files)}
                          {...fieldProps}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4"
                          onClick={() => document.getElementById("photos-upload")?.click()}
                        >
                          Select Files
                        </Button>
                        {value && value.length > 0 && (
                          <div className="mt-4 text-sm text-neutral-600">
                            {Array.from(value).map((file, index) => (
                              <div key={index} className="flex items-center mt-1">
                                <div className="h-6 w-6 bg-neutral-100 rounded flex items-center justify-center mr-2">
                                  {index + 1}
                                </div>
                                {file.name} ({Math.round(file.size / 1024)}KB)
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => setLocation("/incidents")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createIncident.isPending}>
                  {createIncident.isPending ? "Submitting..." : "Report Incident"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
