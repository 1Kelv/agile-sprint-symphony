
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarClock, 
  CheckCircle2, 
  Clock, 
  Flag,
  AlertTriangle,
  Trending
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SprintTimeline = ({ sprints, showAnalytics = false }) => {
  // If no sprints are provided, use demo data
  const timelineSprints = sprints || [
    {
      id: 1,
      name: "Project Setup",
      status: "completed",
      startDate: "Apr 1, 2023",
      endDate: "Apr 15, 2023",
      progress: 100,
      risks: ["Low"],
      velocity: 20
    },
    {
      id: 2,
      name: "Core Features",
      status: "completed",
      startDate: "Apr 16, 2023",
      endDate: "Apr 30, 2023",
      progress: 100,
      risks: ["Medium"],
      velocity: 18
    },
    {
      id: 3,
      name: "User Authentication & Dashboard",
      status: "active",
      startDate: "May 1, 2023",
      endDate: "May 15, 2023",
      progress: 75,
      risks: ["High", "Medium"],
      velocity: 16
    },
    {
      id: 4,
      name: "Advanced Features",
      status: "planned",
      startDate: "May 16, 2023",
      endDate: "May 31, 2023",
      progress: 0,
      risks: ["Low"],
      velocity: null
    },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "active":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "planned":
        return <CalendarClock className="h-4 w-4 text-amber-500" />;
      default:
        return <Flag className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "active":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "planned":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const getRiskBadges = (risks) => {
    if (!risks || risks.length === 0) return null;
    
    return risks.map(risk => {
      let bgColor = "bg-gray-100 text-gray-800";
      
      if (risk === "High") {
        bgColor = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      } else if (risk === "Medium") {
        bgColor = "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      } else if (risk === "Low") {
        bgColor = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      }
      
      return (
        <Badge key={risk} variant="outline" className={`mr-1 ${bgColor}`}>
          <AlertTriangle className="h-3 w-3 mr-1" />
          {risk}
        </Badge>
      );
    });
  };

  // Calculate velocity trend compared to previous sprint
  const getVelocityTrend = (currentIndex) => {
    if (currentIndex === 0 || !timelineSprints[currentIndex].velocity || !timelineSprints[currentIndex-1].velocity) {
      return null;
    }
    
    const currentVelocity = timelineSprints[currentIndex].velocity;
    const previousVelocity = timelineSprints[currentIndex-1].velocity;
    const diff = currentVelocity - previousVelocity;
    
    if (diff > 0) {
      return <span className="text-green-500 text-xs flex items-center"><Trending className="h-3 w-3 mr-1 rotate-45" />+{diff}</span>;
    } else if (diff < 0) {
      return <span className="text-red-500 text-xs flex items-center"><Trending className="h-3 w-3 mr-1 -rotate-45" />{diff}</span>;
    }
    return <span className="text-gray-500 text-xs">No change</span>;
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Sprint Timeline</h2>
      
      <div className="space-y-6">
        {timelineSprints.map((sprint, index) => (
          <div key={sprint.id} className="bg-card rounded-lg border p-4 shadow-sm">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Sprint {sprint.id}</span>
                  <Badge 
                    variant="outline" 
                    className={`flex items-center gap-1 ${getStatusColor(sprint.status)}`}
                  >
                    {getStatusIcon(sprint.status)}
                    <span className="capitalize">{sprint.status}</span>
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  {sprint.startDate} - {sprint.endDate}
                </span>
              </div>
              
              <h3 className="text-lg font-medium">{sprint.name}</h3>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm font-medium">{sprint.progress}%</span>
                </div>
                <Progress value={sprint.progress} className="h-2" />
              </div>

              {/* Risk assessment */}
              {sprint.risks && sprint.risks.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {getRiskBadges(sprint.risks)}
                  </div>
                </div>
              )}
              
              {/* Team velocity analytics */}
              {showAnalytics && sprint.velocity !== null && (
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Team Velocity:</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">{sprint.velocity} points</span>
                    {getVelocityTrend(index)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAnalytics && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Sprint Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Team Velocity Trend</h4>
                <div className="h-40 bg-muted/20 rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Analytics visualization would appear here</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Risk Assessment</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-md">
                    <p className="text-xs text-muted-foreground">High Risk Items</p>
                    <p className="text-xl font-bold">2</p>
                  </div>
                  <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-md">
                    <p className="text-xs text-muted-foreground">Medium Risk Items</p>
                    <p className="text-xl font-bold">3</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-md">
                    <p className="text-xs text-muted-foreground">Low Risk Items</p>
                    <p className="text-xl font-bold">8</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SprintTimeline;
