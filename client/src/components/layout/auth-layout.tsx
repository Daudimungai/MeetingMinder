import { ReactNode, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [isLoginPage] = useRoute("/login");

  useEffect(() => {
    // Redirect to dashboard if already authenticated and on login page
    if (!isLoading && isAuthenticated && isLoginPage) {
      setLocation("/");
    }
  }, [isLoading, isAuthenticated, isLoginPage, setLocation]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold text-primary-800">GEMINI Security</h1>
        <h2 className="mt-2 text-center text-xl text-neutral-700">Security Management System</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {children}
        </div>
      </div>
    </div>
  );
}
