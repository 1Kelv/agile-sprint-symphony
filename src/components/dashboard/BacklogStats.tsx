
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface BacklogStatsProps {
  totalItems?: number;
  storyPoints?: number;
  priorityData?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

const BacklogStats: React.FC = () => {
  // Fetch backlog items from Supabase
  const { data: backlogItems, isLoading, error } = useQuery({
    queryKey: ['backlogItems'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('backlog_items')
        .select('*');
      
      if (error) {
        throw new Error(`Error fetching backlog items: ${error.message}`);
      }
      
      return data;
    }
  });

  // Priority colors mapping
  const priorityColors = {
    "critical": "#FF3B30", // Red
    "high": "#FF9500",     // Orange
    "medium": "#5856D6",   // Purple
    "low": "#34C759"       // Green
  };

  // Process backlog data for visualization
  const getBacklogStats = (): BacklogStatsProps => {
    if (!backlogItems || backlogItems.length === 0) {
      return {
        totalItems: 0,
        storyPoints: 0,
        priorityData: []
      };
    }

    // Count items by priority
    const priorityCounts: Record<string, number> = {};
    let totalStoryPoints = 0;

    backlogItems.forEach(item => {
      // Count by priority
      priorityCounts[item.priority] = (priorityCounts[item.priority] || 0) + 1;
      
      // Sum story points
      totalStoryPoints += item.story_points;
    });

    // Format for chart data
    const priorityData = Object.entries(priorityCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
      value,
      color: priorityColors[name as keyof typeof priorityColors] || "#999999"
    }));

    // Sort by priority (critical -> high -> medium -> low)
    const priorityOrder = { "Critical": 0, "High": 1, "Medium": 2, "Low": 3 };
    priorityData.sort((a, b) => 
      (priorityOrder[a.name as keyof typeof priorityOrder] || 99) - 
      (priorityOrder[b.name as keyof typeof priorityOrder] || 99)
    );

    return {
      totalItems: backlogItems.length,
      storyPoints: totalStoryPoints,
      priorityData
    };
  };

  const stats = getBacklogStats();

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background border rounded shadow-subtle text-xs">
          <p className="font-medium">{`${payload[0].payload.name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card border shadow-subtle overflow-hidden animate-fade-in">
        <div className="px-6 py-5 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-2xl bg-card border shadow-subtle overflow-hidden animate-fade-in">
        <div className="px-6 py-5 border-b bg-muted/30">
          <h2 className="text-lg font-medium">Backlog Status</h2>
        </div>
        
        <div className="p-6 text-center text-muted-foreground">
          <p>Failed to load backlog data.</p>
          <button 
            className="mt-2 text-sm text-agile-primary hover:underline"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card border shadow-subtle overflow-hidden animate-fade-in">
      <div className="px-6 py-5 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Backlog Status</h2>
          <a 
            href="/backlog" 
            className="inline-flex items-center text-xs font-medium text-agile-primary hover:underline"
          >
            View backlog <ArrowRight className="ml-1 w-3 h-3" />
          </a>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-3xl font-semibold text-agile-primary">{stats.totalItems}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <p className="text-3xl font-semibold text-agile-success">{stats.storyPoints}</p>
              <p className="text-xs text-muted-foreground">Estimated Story Points</p>
            </div>
          </div>
          
          <div className="h-48">
            <p className="text-sm font-medium mb-2">Items by Priority</p>
            {stats.priorityData && stats.priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={stats.priorityData}
                  margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    width={60}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {stats.priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>No priority data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BacklogStats;
