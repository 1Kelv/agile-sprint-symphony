
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Sparkles, Zap, Calendar, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SprintOverview from "@/components/dashboard/SprintOverview";
import BacklogStats from "@/components/dashboard/BacklogStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Simulate loading of dashboard data
  useEffect(() => {
    // This would typically fetch actual data from an API
    console.log("Loading dashboard data...");
    
    // Add animation delay
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const handleNewTask = () => {
    navigate("/backlog/new");
  };

  const handleViewSprint = () => {
    navigate("/sprints/current");
  };

  const handleManageTeam = () => {
    navigate("/team");
  };

  const actionButtons = [
    {
      id: 'new-task',
      title: 'New Task',
      description: 'Add to backlog',
      icon: <Plus className="h-5 w-5" />,
      iconClass: 'bg-agile-primary/10 text-agile-primary',
      onClick: handleNewTask,
      delay: 100
    },
    {
      id: 'current-sprint',
      title: 'Current Sprint',
      description: 'View details',
      icon: <span className="font-medium text-sm">S3</span>,
      iconClass: 'bg-agile-secondary/10 text-agile-secondary',
      onClick: handleViewSprint,
      delay: 300
    },
    {
      id: 'team-members',
      title: 'Team Members',
      description: 'Manage team',
      icon: <span className="font-medium text-sm">5</span>,
      iconClass: 'bg-agile-success/10 text-agile-success',
      onClick: handleManageTeam,
      delay: 500
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-agile-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-agile-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-background/80 to-transparent" />
      </div>
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <DashboardHeader username={profile?.username || "User"} />
        
        {/* Welcome Message */}
        <div className={`mb-8 transform transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex items-center mb-2">
            <Sparkles className="w-5 h-5 mr-2 text-amber-400" />
            <h2 className="text-lg font-medium">Welcome to your workspace</h2>
          </div>
          <p className="text-muted-foreground">
            Your team has completed <span className="font-medium text-agile-success">12 tasks</span> this sprint. 
            <span className="ml-2 text-agile-primary hover:underline cursor-pointer">
              View sprint report
            </span>
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {actionButtons.map((action, index) => (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`flex items-center justify-between p-4 rounded-xl border bg-card hover:shadow-elevated transition-all hover-lift text-left group ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ 
                transitionDelay: `${action.delay}ms`,
                transitionDuration: '500ms'
              }}
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 rounded-lg ${action.iconClass} flex items-center justify-center mr-3 group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <div>
                  <h3 className="font-medium">{action.title}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </button>
          ))}
        </div>
        
        {/* Highlight Stats */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 transform transition-all duration-700 delay-300 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 border shadow-subtle">
            <Zap className="w-8 h-8 text-amber-500 mb-2" />
            <span className="text-3xl font-bold text-amber-600 dark:text-amber-400">87%</span>
            <span className="text-sm text-muted-foreground">Sprint Velocity</span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 border shadow-subtle">
            <Calendar className="w-8 h-8 text-purple-500 mb-2" />
            <span className="text-3xl font-bold text-purple-600 dark:text-purple-400">4</span>
            <span className="text-sm text-muted-foreground">Days Remaining</span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 border shadow-subtle">
            <Users className="w-8 h-8 text-green-500 mb-2" />
            <span className="text-3xl font-bold text-green-600 dark:text-green-400">92%</span>
            <span className="text-sm text-muted-foreground">Team Capacity</span>
          </div>
        </div>
        
        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div 
            className={`flex flex-col space-y-6 transform transition-all duration-700 delay-500 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <SprintOverview />
            <BacklogStats />
          </div>
          
          <div 
            className={`transform transition-all duration-700 delay-700 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <RecentActivity />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
