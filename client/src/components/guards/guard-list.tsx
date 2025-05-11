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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  MoreVertical, 
  Search, 
  UserPlus, 
  Eye, 
  Edit, 
  Trash2 
} from "lucide-react";
import { getInitials, statusColorMap } from "@/lib/utils";

export function GuardList() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch guards data
  const { data: guards, isLoading, isError } = useQuery({
    queryKey: ["/api/guards"],
  });

  // Filter guards based on search term
  const filteredGuards = guards?.filter(guard => {
    const fullName = `${guard.user?.firstName || ''} ${guard.user?.lastName || ''}`.toLowerCase();
    const guardId = guard.guardId.toLowerCase();
    const position = guard.position?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    
    return fullName.includes(search) || 
           guardId.includes(search) || 
           position.includes(search);
  });

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Guards Management</CardTitle>
          <CardDescription>Manage security guards and their assignments</CardDescription>
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
          <CardTitle>Guards Management</CardTitle>
          <CardDescription>Manage security guards and their assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-red-500">Failed to load guards data</h3>
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
        <CardTitle>Guards Management</CardTitle>
        <CardDescription>Manage security guards and their assignments</CardDescription>
        <div className="flex justify-between items-center mt-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
            <Input
              placeholder="Search guards..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link href="/guards/create">
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Guard
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {!filteredGuards?.length ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-neutral-600">No guards found{searchTerm ? " matching your search" : ""}.</p>
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
                <TableHead>Guard</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGuards.map((guard) => {
                const fullName = `${guard.user?.firstName || ''} ${guard.user?.lastName || ''}`.trim();
                
                return (
                  <TableRow key={guard.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <AvatarImage src="" alt={fullName} />
                          <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{fullName}</div>
                          <div className="text-sm text-neutral-500">{guard.guardId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{guard.position || "Guard"}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{guard.user?.email}</div>
                        <div className="text-neutral-500">{guard.user?.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={statusColorMap[guard.status || "active"]}
                      >
                        {guard.status || "Active"}
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
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
