
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import SprintCard from "@/components/sprint/SprintCard";
import { useToast } from "@/hooks/use-toast";

const SprintsList = ({ 
  sprints, 
  tasks, 
  loading,
  error,
  loadSprints,
  onEdit,
  onView,
  onDelete,
  onCreate
}) => {
  const { toast } = useToast();
  
  // Handle retry with better error feedback
  const handleRetry = () => {
    console.log("Retrying sprint data load");
    loadSprints(true);
    toast({
      title: "Refreshing data",
      description: "Attempting to reload sprints data..."
    });
  };
  
  // Show loading state
  if (loading) {
    console.log("Showing loading state for sprints");
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted/50"></CardHeader>
            <CardContent className="h-32 bg-muted/30"></CardContent>
            <CardFooter className="h-12 bg-muted/20"></CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    console.error("Sprint fetch error:", error);
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-2">
          Error loading sprints: {error?.message || "Unknown error"}
        </p>
        <Button
          onClick={handleRetry}
          variant="outline"
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!sprints || sprints.length === 0) {
    console.log("No sprints to display");
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No sprints yet</h3>
        <p className="text-muted-foreground mb-6">
          Start by creating your first sprint to organize your work.
        </p>
        <Button onClick={onCreate}>Create Your First Sprint</Button>
      </div>
    );
  }

  console.log("Rendering sprints list with", sprints.length, "sprints");
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sprints.map((sprint) => {
          // Filter tasks safely for this sprint 
          const sprintTasks = sprint && sprint.id ? 
            tasks?.filter(task => task && task.sprint_id === sprint.id) || [] : 
            [];
            
          return (
            <SprintCard 
              key={sprint.id}
              sprint={sprint}
              tasks={sprintTasks}
              onEdit={() => onEdit(sprint)}
              onView={() => onView(sprint)}
              onDelete={() => onDelete(sprint)}
            />
          );
        })}
      </div>
    </>
  );
};

export default SprintsList;
