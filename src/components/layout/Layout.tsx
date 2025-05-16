
import React, { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { ErrorBoundary } from "../common/ErrorBoundary";

interface LayoutProps {
  children: ReactNode;
  hideSidebar?: boolean;
  projectId?: string | null;
  projects?: any[];
  onProjectChange?: (projectId: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  hideSidebar = false,
  projectId,
  projects,
  onProjectChange
}) => {
  const location = useLocation();
  const [isReady, setIsReady] = useState(false);
  
  // Ensure stable layout rendering
  useEffect(() => {
    // Short delay to ensure components mount properly
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar 
        projectId={projectId} 
        projects={projects} 
        onProjectChange={onProjectChange} 
      />
      
      <ErrorBoundary>
        <main className="flex-1 pt-16 relative z-0">
          <div className="container mx-auto px-4 py-4">
            {isReady ? children : (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted/30 rounded w-1/3"></div>
                <div className="h-64 bg-muted/20 rounded"></div>
              </div>
            )}
          </div>
        </main>
      </ErrorBoundary>
      
      {/* Background decorative elements with lower z-index */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-agile-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-agile-secondary/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default Layout;
