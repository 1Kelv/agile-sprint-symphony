
import React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { ChevronRight, LogOut, User, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/ThemeProvider";

const NavbarMobileMenu = ({ isOpen, navItems, user, handleSignOut, children, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const handleNavItemClick = (path) => {
    navigate(path);
    if (onClose) onClose(); // Close menu when navigating
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 transform transition-all duration-300 md:hidden bg-background dark:bg-background shadow-subtle pt-20">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
          &times;
        </Button>
      </div>
      
      <nav className="container mx-auto px-4 flex flex-col space-y-2 overflow-y-auto max-h-[calc(100vh-5rem)]">
        {children}
      
        {user ? (
          <>
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg font-medium">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-medium">{user.email?.split("@")[0] || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
            
            {Array.isArray(navItems) && navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavItemClick(item.path)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg transition-all w-full text-left",
                  location && location.pathname === item.path
                    ? "bg-muted text-primary"
                    : "text-foreground hover:bg-muted/50"
                )}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span className="font-medium">{item.name}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}
            
            <button
              onClick={() => {
                handleNavItemClick("/profile");
              }}
              className="flex items-center justify-between p-3 rounded-lg transition-all text-foreground hover:bg-muted/50 w-full text-left"
            >
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5" />
                <span className="font-medium">Profile</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => {
                handleSignOut();
                onClose();
              }}
              className="flex items-center justify-between p-3 rounded-lg transition-all text-red-500 hover:bg-muted/50 w-full text-left"
            >
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
              </div>
            </button>
          </>
        ) : (
          <Link
            to="/auth"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-lg transition-all hover:bg-muted/50 text-foreground"
          >
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5" />
              <span className="font-medium">Sign In</span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
        
        <div className="mt-4 p-3 border-t border-border flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Toggle theme</span>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleTheme}
            className="h-8 w-8"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default NavbarMobileMenu;
