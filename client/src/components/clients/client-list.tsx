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
  Building, 
  Eye, 
  Edit, 
  Trash2, 
  MapPin 
} from "lucide-react";
import { statusColorMap, formatDate } from "@/lib/utils";

export function ClientList() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch clients data
  const { data: clients, isLoading, isError } = useQuery({
    queryKey: ["/api/clients"],
  });

  // Filter clients based on search term
  const filteredClients = clients?.filter(client => {
    const name = client.name.toLowerCase();
    const address = client.address?.toLowerCase() || '';
    const contactPerson = client.contactPerson?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return name.includes(search) || 
           address.includes(search) || 
           contactPerson.includes(search);
  });

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Clients</CardTitle>
          <CardDescription>Manage client accounts and contracts</CardDescription>
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
          <CardTitle>Clients</CardTitle>
          <CardDescription>Manage client accounts and contracts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-500">Failed to load clients data</h3>
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
        <CardTitle>Clients</CardTitle>
        <CardDescription>Manage client accounts and contracts</CardDescription>
        <div className="flex justify-between items-center mt-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              placeholder="Search clients..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/clients/create">
            <Button>
              <Building className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {!filteredClients?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-neutral-600">No clients found{searchTerm ? " matching your search" : ""}.</p>
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
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Contract Period</TableHead>
                <TableHead>Locations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded bg-primary-100 flex items-center justify-center">
                          <Building className="h-5 w-5 text-primary-700" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="font-medium">{client.name}</div>
                        <div className="text-sm text-neutral-500">{client.address}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{client.contactPerson}</div>
                      <div className="text-neutral-500">{client.contactPhone}</div>
                      <div className="text-neutral-500">{client.contactEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(client.contractStart, "MMM dd, yyyy")}</div>
                      <div className="text-neutral-500">to</div>
                      <div>{formatDate(client.contractEnd, "MMM dd, yyyy")}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.locations && client.locations.length > 0 ? (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-neutral-500 mr-1" />
                        <span>{client.locations.length}</span>
                      </div>
                    ) : (
                      <div className="text-neutral-500 text-sm">No locations</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={statusColorMap[client.status || "active"]}
                    >
                      {client.status || "Active"}
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
