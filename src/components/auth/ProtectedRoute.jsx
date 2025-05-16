
import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Skeleton } from "../ui/skeleton";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [initialLoading, setInitialLoading] = useState(true);
  const [fallbackTimer, setFallbackTimer] = useState(null);
  
  // Add a small delay to avoid flickering and handle edge cases
  useEffect(() => {
    // Short initial delay
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 200);
    
    // Fallback timer in case loading takes too long
    const fallback = setTimeout(() => {
      setInitialLoading(false);
      console.log("Fallback timer triggered for authentication");
    }, 2000);
    
    setFallbackTimer(fallback);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(fallback);
    };
  }, []);
  
  // Clear fallback when loading completes
  useEffect(() => {
    if (!loading && fallbackTimer) {
      clearTimeout(fallbackTimer);
    }
  }, [loading, fallbackTimer]);
  
  // Handle loading state with a skeleton UI
  if (loading || initialLoading) {
    return (
      <div className="container mx-auto p-6 animate-fade-in">
        <div className="space-y-4">
          <div className="h-16 flex items-center justify-between px-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }
  
  // For demonstration purposes, always allow access
  console.log("User authentication state:", user ? "Authenticated" : "Not authenticated");
  return <>{children}</>;
};

export default ProtectedRoute;
