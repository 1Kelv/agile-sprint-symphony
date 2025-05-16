
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const TaskDependencies = ({ task, onUpdate }) => {
  const [allTasks, setAllTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [dependencies, setDependencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddingDependency, setIsAddingDependency] = useState(false);

  useEffect(() => {
    if (task?.id) {
      fetchAllTasks();
      fetchDependencies();
    }
  }, [task]);

  const fetchAllTasks = async () => {
    try {
      // Fetch all tasks except the current one
      const { data, error } = await supabase
        .from("backlog_items")
        .select("id, title")
        .neq("id", task.id);

      if (error) throw error;
      setAllTasks(data || []);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    }
  };

  const fetchDependencies = async () => {
    setLoading(true);
    try {
      // Fetch dependencies where this task depends on others
      const { data, error } = await supabase
        .from("task_dependencies")
        .select("dependency_task_id, backlog_items!inner(*)")
        .eq("dependent_task_id", task.id);

      if (error) throw error;
      
      // Map to include the task details
      const mappedDependencies = data.map(item => ({
        id: item.dependency_task_id,
        title: item.backlog_items.title,
        status: item.backlog_items.status,
        priority: item.backlog_items.priority
      }));
      
      setDependencies(mappedDependencies);
    } catch (error) {
      console.error("Error fetching dependencies:", error);
      toast({
        title: "Error",
        description: "Failed to fetch task dependencies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addDependency = async () => {
    if (!selectedTask) return;
    
    setIsAddingDependency(true);
    try {
      // Check if dependency already exists
      const isDuplicate = dependencies.some(dep => dep.id === selectedTask);
      if (isDuplicate) {
        toast({
          title: "Duplicate dependency",
          description: "This task is already a dependency",
          variant: "destructive",
        });
        return;
      }

      // Add dependency
      const { error } = await supabase
        .from("task_dependencies")
        .insert({
          dependent_task_id: task.id,
          dependency_task_id: selectedTask
        });

      if (error) throw error;

      // Refresh dependencies
      fetchDependencies();
      setSelectedTask("");
      
      toast({
        title: "Dependency added",
        description: "Task dependency has been added",
      });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error adding dependency:", error);
      toast({
        title: "Error",
        description: "Failed to add task dependency",
        variant: "destructive",
      });
    } finally {
      setIsAddingDependency(false);
    }
  };

  const removeDependency = async (dependencyId) => {
    try {
      const { error } = await supabase
        .from("task_dependencies")
        .delete()
        .eq("dependent_task_id", task.id)
        .eq("dependency_task_id", dependencyId);

      if (error) throw error;

      // Refresh dependencies
      fetchDependencies();
      
      toast({
        title: "Dependency removed",
        description: "Task dependency has been removed",
      });
      
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error removing dependency:", error);
      toast({
        title: "Error",
        description: "Failed to remove task dependency",
        variant: "destructive",
      });
    }
  };

  const getTaskStatusBadge = (status) => {
    switch (status) {
      case "done":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "todo":
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getTaskPriorityBadge = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    }
  };

  if (!task) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Task Dependencies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="dependency">Add Dependency</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedTask}
                  onValueChange={setSelectedTask}
                  disabled={isAddingDependency}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                  <SelectContent>
                    {allTasks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={addDependency} 
                  disabled={!selectedTask || isAddingDependency}
                >
                  {isAddingDependency ? "Adding..." : "Add"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Dependencies</Label>
              {loading ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : dependencies.length > 0 ? (
                <div className="space-y-2">
                  {dependencies.map((dep) => (
                    <div 
                      key={dep.id} 
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{dep.title}</span>
                        <div className="flex gap-2 mt-1">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTaskStatusBadge(dep.status)}`}>
                            {dep.status}
                          </span>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTaskPriorityBadge(dep.priority)}`}>
                            {dep.priority}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeDependency(dep.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No dependencies found
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskDependencies;
