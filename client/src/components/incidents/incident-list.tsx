import { useState } from "react";
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
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  MoreVertical, 
  Search, 
  AlertTriangle, 
  Eye, 
  Edit, 
  Trash2,
  FileImage 
} from "lucide-react";
import { statusColorMap, formatDate } from "@/lib/utils";

export function IncidentList() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch incidents data
  const { data: incidents, isLoading, isError } = useQuery({
    queryKey: ["/api/incidents"],
  });

  // Filter incidents based on search term
  const filteredIncidents = incidents?.filter(incident => {
    const title = incident.title.toLowerCase();
    const location = incident.location?.name?.toLowerCase() || '';
    const category = incident.category?.name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return title.includes(search) || 
           location.includes(search) || 
           category.includes(search);
  });

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Incident Reports</CardTitle>
          <CardDescription>View and manage security incident reports</CardDescription>
          <div className="flex justify-between items-center mt-4">
            <div className="relative w-64">
              <div className="animate-pulse bg-neutral-200 h-10 w-full rounded-md"></div>
            </div>
            <div className="animate-pulse bg-neutral-200 h-10 w-32 rounded-md"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse bg-neutral-200 h-12 w-full rounded-md"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse bg-neutral-200 h-16 w-full rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Incident Reports</CardTitle>
          <CardDescription>View and manage security incident reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-500">Failed to load incidents data</h3>
            <p className="mt-2 text-neutral-600">Please try again later or contact support.</p>
            <Button variant="outline" className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Incident Reports</CardTitle>
        <CardDescription>View and manage security incident reports</CardDescription>
        <div className="flex justify-between items-center mt-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              placeholder="Search incidents..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/incidents/create">
            <Button>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Report Incident
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {!filteredIncidents?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-neutral-600">No incidents found{searchTerm ? " matching your search" : ""}.</p>
            {searchTerm && (
              <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Incident</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredIncidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {incident.photos && incident.photos.length > 0 ? (
                          <div className="h-10 w-10 rounded bg-neutral-100 flex items-center justify-center">
                            <FileImage className="h-5 w-5 text-neutral-500" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded bg-neutral-100 flex items-center justify-center">
                            <AlertTriangle className="h-5 w-5 text-neutral-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{incident.title}</div>
                        <div className="text-sm text-neutral-500">
                          {incident.category?.name || "Uncategorized"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{incident.location?.name || "Unknown"}</TableCell>
                  <TableCell>{formatDate(incident.date, "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={statusColorMap[incident.status || "open"]}
                    >
                      {incident.status || "Open"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={statusColorMap[incident.priority || "medium"]}
                    >
                      {incident.priority || "Medium"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
