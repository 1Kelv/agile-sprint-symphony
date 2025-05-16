
import React from "react";
import { Calendar, ChevronRight, Edit, Trash2, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const SprintCard = ({ sprint, tasks = [], onEdit, onView, onDelete }) => {
  if (!sprint) return null;
  
  const { name, start_date, end_date, status, progress = 0 } = sprint;
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("en-US", { 
        month: "short", 
        day: "numeric" 
      }).format(date);
    } catch (e) {
      console.error("Error formatting date:", e);
      return "";
    }
  };
  
  // Determine status badge color
  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-200">
          <Clock className="mr-1 h-3 w-3" />Active
        </Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-200">
          <CheckCircle className="mr-1 h-3 w-3" />Completed
        </Badge>;
      case "planned":
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-200">
          Planned
        </Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-200">
          Cancelled
        </Badge>;
      default:
        return <Badge variant="outline">
          {status || "Planned"}
        </Badge>;
    }
  };

  // Calculate completed tasks safely
  const completedTasksCount = Array.isArray(tasks) 
    ? tasks.filter(t => t && t.status === "completed").length 
    : 0;
  
  // Get total tasks count safely
  const totalTasksCount = Array.isArray(tasks) ? tasks.length : 0;
  
  // Calculate progress percentage
  const progressValue = typeof progress === 'number' ? progress : 0;
  
  // Event handlers with safety checks
  const handleView = () => {
    if (typeof onView === 'function') onView(sprint);
  };
  
  const handleEdit = (e) => {
    e.stopPropagation();
    if (typeof onEdit === 'function') onEdit(sprint);
  };
  
  const handleDelete = (e) => {
    e.stopPropagation();
    if (typeof onDelete === 'function') onDelete(sprint);
  };
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3 border-b">
        <div className="flex justify-between items-start mb-2">
          {getStatusBadge()}
        </div>
        <CardTitle className="text-lg line-clamp-2">{name}</CardTitle>
      </CardHeader>
      
      <CardContent className="py-4 flex-grow">
        <div className="flex items-center text-muted-foreground text-sm mb-4">
          <Calendar className="mr-2 h-4 w-4" />
          <span>{formatDate(start_date)} — {formatDate(end_date)}</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">Progress</span>
            <span>{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="border rounded-md p-2">
            <div className="text-lg font-semibold">{completedTasksCount}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="border rounded-md p-2">
            <div className="text-lg font-semibold">{totalTasksCount}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-3 border-t flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleView}
        >
          View <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SprintCard;
