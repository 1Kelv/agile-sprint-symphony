
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Sprint {
  id: number;
  name: string;
  description?: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  progress: number;
  tasks_completed: number;
  tasks_total: number;
  story_points?: number;
  project_id: string;
  created_at: string;
}

interface Task {
  id: string | number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  sprint_id: string | number;
  story_points?: number;
  created_at: string;
}

export function useSprintLoading(projectId: string | null = null, viewCurrent = false) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const loadSprints = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      console.log("Loading sprints with project ID:", projectId);
      console.log("View current:", viewCurrent);
      
      let query = supabase.from('sprints').select('*');
      
      // Apply filters 
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      if (viewCurrent) {
        query = query.eq('status', 'active');
      }
      
      // Order by most recent first
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log("Loaded sprints:", data);
      setSprints(data as Sprint[] || []);
      
      // Load tasks related to these sprints if we have any sprints
      if (data && data.length > 0) {
        await loadTasksForSprints(data as Sprint[]);
      } else {
        setTasks([]);
      }
      
      return data as Sprint[];
    } catch (err: any) {
      console.error("Error loading sprints:", err);
      setError(err);
      setSprints([]);
      setTasks([]);
      return [] as Sprint[];
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [projectId, viewCurrent]);
  
  const loadTasksForSprints = async (loadedSprints: Sprint[]) => {
    try {
      // Extract sprint IDs
      const sprintIds = loadedSprints.map(sprint => sprint.id);
      
      if (sprintIds.length === 0) {
        setTasks([]);
        return;
      }
      
      console.log("Loading tasks for sprint IDs:", sprintIds);
      
      // Load tasks for these sprints
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .in('sprint_id', sprintIds);
        
      if (error) throw error;
      
      console.log("Loaded tasks:", data);
      setTasks(data || []);
    } catch (err: any) {
      console.error("Error loading tasks:", err);
      setTasks([]);
    }
  };

  return {
    sprints,
    setSprints,
    tasks,
    loading,
    error,
    loadSprints
  };
}

export default useSprintLoading;
