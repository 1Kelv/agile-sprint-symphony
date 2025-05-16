
import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { ErrorBoundary } from "../common/ErrorBoundary";

const Layout = ({ children, hideSidebar = false }) => {
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <ErrorBoundary>
        <main className="flex-1 pt-16 relative z-0">
          <div className="container mx-auto px-4 py-4">
            {children}
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
