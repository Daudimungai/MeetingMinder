import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LoginInput } from "@shared/schema";
import { AuthUser } from "@shared/types";

export function useAuth() {
  const queryClient = useQueryClient();

  // Get current user
  const { data: user, isLoading, isError } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    // On error, return null (user not authenticated)
    onError: () => null,
  });

  // Login mutation
  const login = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await res.json();
      
      // Store token in localStorage
      localStorage.setItem("auth_token", data.token);
      
      return data.user as AuthUser;
    },
    onSuccess: (userData) => {
      // Invalidate user query to refetch with new user data
      queryClient.setQueryData(["/api/auth/user"], userData);
    },
  });

  // Logout function
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem("auth_token");
    
    // Clear user from cache
    queryClient.setQueryData(["/api/auth/user"], null);
    
    // Invalidate all queries to refetch data with new auth state
    queryClient.invalidateQueries();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
