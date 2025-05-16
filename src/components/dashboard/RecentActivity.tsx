
import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, CheckSquare, MessageSquare, GitBranch, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ActivityItem {
  id: number;
  type: "task_created" | "task_completed" | "comment" | "pull_request" | "issue";
  user_id: string;
  content: string;
  created_at: string;
  team_member?: {
    name: string;
    avatar: string;
  }
}

const RecentActivity: React.FC = () => {
  // Fetch recent activity from Supabase
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activities')
        .select(`
          *,
          team_member:user_id(name, avatar)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        throw new Error(`Error fetching activities: ${error.message}`);
      }
      
      return data as ActivityItem[];
    }
  });
  
  // Show error toast if fetch fails
  useEffect(() => {
    if (error) {
      toast.error("Failed to load recent activities");
      console.error("Activity fetch error:", error);
    }
  }, [error]);

  // Get activity icon based on type
  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch(type) {
      case "task_created": return <Plus className="w-3 h-3" />;
      case "task_completed": return <CheckSquare className="w-3 h-3" />;
      case "comment": return <MessageSquare className="w-3 h-3" />;
      case "pull_request": return <GitBranch className="w-3 h-3" />;
      case "issue": return <AlertCircle className="w-3 h-3" />;
      default: return null;
    }
  };

  // Get activity color based on type
  const getActivityColor = (type: ActivityItem["type"]) => {
    switch(type) {
      case "task_created": return "bg-agile-primary text-white";
      case "task_completed": return "bg-agile-success text-white";
      case "comment": return "bg-agile-secondary text-white";
      case "pull_request": return "bg-agile-neutral text-white";
      case "issue": return "bg-agile-danger text-white";
      default: return "bg-muted text-foreground";
    }
  };
  
  // Format the time since activity was created
  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="rounded-2xl bg-card border shadow-subtle overflow-hidden animate-fade-in">
      <div className="px-6 py-5 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent Activity</h2>
          <Link 
            to="/activity" 
            className="inline-flex items-center text-xs font-medium text-agile-primary hover:underline"
          >
            View all <ArrowRight className="ml-1 w-3 h-3" />
          </Link>
        </div>
      </div>
      
      <div className="divide-y">
        {isLoading ? (
          // Loading state
          Array(5).fill(0).map((_, index) => (
            <div key={`skeleton-${index}`} className="p-4 animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="p-4 text-center text-muted-foreground">
            <p>Failed to load recent activities.</p>
            <button 
              className="mt-2 text-sm text-agile-primary hover:underline"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : activities && activities.length > 0 ? (
          // Data loaded successfully
          activities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                  {activity.team_member?.avatar || "?"}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.team_member?.name || "Unknown User"}</span>
                    <span className="text-muted-foreground ml-1">{activity.content}</span>
                  </p>
                  
                  <div className="flex items-center mt-1">
                    <div className={`flex items-center justify-center h-4 w-4 rounded-full ${getActivityColor(activity.type)} mr-1.5`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          // No data found
          <div className="p-4 text-center text-muted-foreground">
            <p>No recent activities found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
