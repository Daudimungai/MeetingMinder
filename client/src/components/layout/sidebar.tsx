import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  Home,
  Users,
  Calendar,
  AlertTriangle,
  Building,
  BarChart,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Close sidebar on location change for mobile
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location]);
  
  // Close sidebar when escape key is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    };
    
    window.addEventListener("keydown", handleEsc);
    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, []);
  
  // Prevent scrolling when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMobileOpen]);

  const fullName = user ? 
    `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 
    "User";
  
  const navigation = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
      current: location === "/",
    },
    {
      name: "Guards Management",
      href: "/guards",
      icon: Users,
      current: location.startsWith("/guards"),
    },
    {
      name: "Schedules",
      href: "/schedules",
      icon: Calendar,
      current: location.startsWith("/schedules"),
    },
    {
      name: "Incidents",
      href: "/incidents",
      icon: AlertTriangle,
      current: location.startsWith("/incidents"),
    },
    {
      name: "Clients",
      href: "/clients",
      icon: Building,
      current: location.startsWith("/clients"),
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart,
      current: location.startsWith("/reports"),
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: location.startsWith("/settings"),
    },
  ];

  // Mobile menu toggle button
  const MobileMenuToggle = () => (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden absolute top-4 right-4 z-50"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      aria-label={isMobileOpen ? "Close menu" : "Open menu"}
    >
      {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </Button>
  );

  // Conditionally apply sidebar classes based on mobile state
  const sidebarClasses = cn(
    "bg-white shadow-lg w-64 flex-shrink-0 border-r border-neutral-200 fixed inset-y-0 left-0 z-30 flex flex-col h-full",
    {
      "-translate-x-full": !isMobileOpen,
      "translate-x-0": isMobileOpen,
    },
    "transition-transform duration-200 ease-in-out md:translate-x-0",
    className
  );

  return (
    <>
      {/* Sidebar content */}
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-primary-800">GEMINI Security</h1>
              <MobileMenuToggle />
            </div>
          </div>
          
          {/* User Info */}
          <div className="px-6 py-4 border-b border-neutral-200">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={undefined} alt={fullName} />
                <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{fullName}</p>
                <p className="text-xs text-neutral-500">{user?.role || "User"}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href}
                >
                  <a
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md w-full",
                      item.current
                        ? "sidebar-item active bg-primary-50 text-primary-800 border-l-2 border-primary-800"
                        : "sidebar-item text-neutral-600 hover:bg-neutral-100"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 mr-2",
                      item.current
                        ? "text-primary-800"
                        : "text-neutral-500"
                    )} />
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          </nav>
          
          {/* Logout */}
          <div className="px-6 py-4 border-t border-neutral-200">
            <Button
              variant="ghost"
              className="flex items-center w-full text-sm font-medium text-neutral-600 hover:text-neutral-900"
              onClick={logout}
            >
              <LogOut className="h-5 w-5 mr-2 text-neutral-500" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      
      {/* Mobile menu button - outside sidebar for accessibility */}
      <div className="fixed top-4 left-4 z-20 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className={cn("bg-white/90 shadow-sm", isMobileOpen && "hidden")}
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}
