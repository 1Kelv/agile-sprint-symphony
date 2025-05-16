
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Code2,
  MenuIcon,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import NavbarMobileMenu from "./NavbarMobileMenu";
import NavbarActions from "./NavbarActions";
import NavbarLogo from "./NavbarLogo";

const Navbar = ({ projectId, projects, onProjectChange }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're on the landing page or not
  const isLanding = location.pathname === "/";
  
  // Debug
  console.log("Navbar rendering:", { 
    user, 
    location: location?.pathname,
    isLanding 
  });

  // Handle project selection
  const handleProjectSelect = (projectId) => {
    if (typeof onProjectChange === 'function') {
      onProjectChange(projectId);
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full ${isLanding ? "bg-transparent" : "bg-background/80 backdrop-blur-md border-b"}`}>
      <nav className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <NavbarLogo />
        </div>

        {/* Desktop navigation */}
        <div className="hidden md:flex items-center space-x-1">
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
        <div className="flex items-center gap-2">
          <NavbarActions user={user} />
          
          {/* Mobile menu button */}
          <Button
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>

        {/* Mobile menu sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0">
            <NavbarMobileMenu 
              isAuthenticated={!!user} 
              onClose={() => setMobileOpen(false)}
              projects={projects}
              selectedProject={projectId}
              handleProjectChange={handleProjectSelect}
            />
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};

export default Navbar;
