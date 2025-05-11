import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { generateGuardId } from "@/lib/utils";
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

// Form schema based on the insertGuardSchema in schema.ts
const guardFormSchema = z.object({
  userId: z.number().optional(),
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  email: z.string().email({ message: "Invalid email address" }).optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  guardId: z.string().min(3, { message: "Guard ID is required" }),
  nationalId: z.string().min(3, { message: "National ID is required" }),
  position: z.string().min(1, { message: "Position is required" }),
  address: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional().or(z.literal("")),
});

type GuardFormValues = z.infer<typeof guardFormSchema>;

export function GuardForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generatedId] = useState(generateGuardId());

  // Get roles for role selection
  const { data: roles } = useQuery({
    queryKey: ["/api/roles"],
    staleTime: Infinity,
  });

  // Form with default values
  const form = useForm<GuardFormValues>({
    resolver: zodResolver(guardFormSchema),
    defaultValues: {
      guardId: generatedId,
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      email: "",
      phone: "",
      nationalId: "",
      position: "Guard",
      address: "",
      emergencyContact: "",
    },
  });

  // Create guard mutation
  const createGuard = useMutation({
    mutationFn: async (values: GuardFormValues) => {
      // First create user
      const userRes = await apiRequest("POST", "/api/users", {
        username: values.username,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        roleId: 4, // Guard role ID (would be better to get this dynamically)
      });
      
      const userData = await userRes.json();
      
      // Then create guard with the user ID
      const guardRes = await apiRequest("POST", "/api/guards", {
        userId: userData.id,
        guardId: values.guardId,
        nationalId: values.nationalId,
        position: values.position,
        address: values.address,
        emergencyContact: values.emergencyContact,
      });
      
      return guardRes.json();
    },
    onSuccess: () => {
      toast({
        title: "Guard created",
        description: "The guard has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/guards"] });
      setLocation("/guards");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create guard: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submit handler
  const onSubmit = (values: GuardFormValues) => {
    createGuard.mutate(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Guard</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">User Information</h3>
                
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Guard Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Guard Information</h3>
                
                <FormField
                  control={form.control}
                  name="guardId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guard ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Guard ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="nationalId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>National ID</FormLabel>
                      <FormControl>
                        <Input placeholder="National ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Position</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Guard">Guard</SelectItem>
                          <SelectItem value="Team Leader">Team Leader</SelectItem>
                          <SelectItem value="Supervisor">Supervisor</SelectItem>
                          <SelectItem value="Specialist">Specialist</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="emergencyContact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Emergency Contact</FormLabel>
                      <FormControl>
                        <Input placeholder="Emergency Contact" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => setLocation("/guards")}>
                Cancel
              </Button>
              <Button type="submit" disabled={createGuard.isPending}>
                {createGuard.isPending ? "Creating..." : "Create Guard"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
