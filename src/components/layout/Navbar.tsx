
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ListTodo, 
  Timer, 
  Users, 
  Settings, 
  Menu, 
  X,
  ChevronDown
} from "lucide-react";
import { ThemeToggleButton } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import NavbarUserMenu from "./NavbarUserMenu";
import NavbarMobileMenu from "./NavbarMobileMenu";
import NavbarLogo from "./NavbarLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  projectId?: string | null;
  projects?: any[];
  onProjectChange?: (projectId: string) => void;
}

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: "Backlog", path: "/backlog", icon: <ListTodo className="w-5 h-5" /> },
  { name: "Sprints", path: "/sprints", icon: <Timer className="w-5 h-5" /> },
  { name: "Team", path: "/team", icon: <Users className="w-5 h-5" /> },
  { name: "Settings", path: "/settings", icon: <Settings className="w-5 h-5" /> },
];

const Navbar: React.FC<NavbarProps> = ({ projectId, projects, onProjectChange }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Check if we're on the landing page
  const isLanding = location.pathname === "/";
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  const handleSignOut = async () => {
    console.log("Sign out initiated");
    await signOut();
    navigate("/");
  };

  // Handle project selection
  const handleProjectSelect = (projectId: string) => {
    if (typeof onProjectChange === 'function') {
      onProjectChange(projectId);
    }
  };
  
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isLanding ? "bg-transparent" : "bg-background/80 backdrop-blur-md border-b"
    )}>
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center">
          <NavbarLogo />
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-2">
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/backlog">Backlog</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/sprints">Sprints</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/team">Team</Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/">Home</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/about">About</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/features">Features</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/pricing">Pricing</Link>
              </Button>
            </>
          )}
        </div>
        
        {/* Right side - auth/profile */}
        <div className="flex items-center space-x-2">
          <ThemeToggleButton />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block max-w-[100px] truncate">
                    {user.user_metadata?.username || user.email?.split("@")[0] || "User"}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
          
          {/* Mobile menu button */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <NavbarMobileMenu 
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        isAuthenticated={!!user}
        projects={projects}
        selectedProject={projectId}
        handleProjectChange={handleProjectSelect}
      />
    </header>
  );
};

export default Navbar;
