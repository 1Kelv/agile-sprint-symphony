
import React from "react";
import { ArrowRight, Calendar, Check, Circle, Clock } from "lucide-react";

interface SprintProps {
  number: number;
  name: string;
  status: "active" | "planned" | "completed";
  startDate: string;
  endDate: string;
  progress: number;
}

const SprintOverview: React.FC = () => {
  // Mock data for the active sprint
  const activeSprint: SprintProps = {
    number: 3,
    name: "User Authentication & Dashboard",
    status: "active",
    startDate: "May 15, 2023",
    endDate: "May 29, 2023",
    progress: 68,
  };

  // Getting status colors
  const getStatusColor = (status: SprintProps["status"]) => {
    switch(status) {
      case "active": return "text-agile-primary";
      case "planned": return "text-agile-neutral";
      case "completed": return "text-agile-success";
      default: return "text-muted-foreground";
    }
  };

  // Getting status icon
  const getStatusIcon = (status: SprintProps["status"]) => {
    switch(status) {
      case "active": return <Clock className="w-4 h-4" />;
      case "planned": return <Circle className="w-4 h-4" />;
      case "completed": return <Check className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="rounded-2xl bg-card border shadow-subtle overflow-hidden animate-fade-in">
      <div className="px-6 py-5 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Current Sprint</h2>
          <a 
            href="/sprints" 
            className="inline-flex items-center text-xs font-medium text-agile-primary hover:underline"
          >
            View all sprints <ArrowRight className="ml-1 w-3 h-3" />
          </a>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-muted">
                Sprint #{activeSprint.number}
              </span>
              <span className={`inline-flex items-center text-xs ${getStatusColor(activeSprint.status)}`}>
                {getStatusIcon(activeSprint.status)}
                <span className="ml-1 capitalize">{activeSprint.status}</span>
              </span>
            </div>
            
            <h3 className="text-xl font-medium">{activeSprint.name}</h3>
            
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              {activeSprint.startDate} - {activeSprint.endDate}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm font-medium">{activeSprint.progress}%</span>
            </div>
            
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-agile-primary transition-all duration-500 ease-out"
                style={{ width: `${activeSprint.progress}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 text-center">
              <p className="text-3xl font-semibold text-agile-success">12</p>
              <p className="text-xs text-muted-foreground">Completed Tasks</p>
            </div>
            
            <div className="border rounded-lg p-4 text-center">
              <p className="text-3xl font-semibold text-agile-primary">7</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SprintOverview;
