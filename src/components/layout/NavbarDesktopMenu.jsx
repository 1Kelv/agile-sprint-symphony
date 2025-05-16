
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const NavbarDesktopMenu = ({ navItems, user }) => {
  const location = useLocation();

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {user ? (
        navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center space-x-1 py-2 text-sm font-medium transition-all hover:text-agile-primary relative",
              location.pathname === item.path
                ? "text-agile-primary after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-agile-primary after:rounded-full after:scale-x-100"
                : "text-muted-foreground after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-agile-primary after:rounded-full after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            )}
          >
            {item.icon}
            <span>{item.name}</span>
          </Link>
        ))
      ) : (
        <Link 
          to="/auth" 
          className="flex items-center space-x-1 py-2 text-sm font-medium transition-all hover:text-agile-primary relative"
        >
          <span>Sign In</span>
        </Link>
      )}
    </nav>
  );
};

export default NavbarDesktopMenu;
