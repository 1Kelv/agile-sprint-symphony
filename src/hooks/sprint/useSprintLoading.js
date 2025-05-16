
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import TaskService from "@/services/TaskService";

export function useSprintLoading(projectId = null, viewCurrent = false) {
  const [sprints, setSprints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to load sprint data
  const loadSprints = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
      setError(null);
    }
    
    try {
      console.log("Loading sprints with projectId:", projectId, "viewCurrent:", viewCurrent);
      
      // Get sprints from Supabase
      let query = supabase.from('sprints').select('*');
      
      // Apply filters if provided
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      // Only get active or planning sprints if viewing current
      if (viewCurrent) {
        query = query.in('status', ['active', 'planning']);
      }
      
      // Add default ordering
      query = query.order('created_at', { ascending: false });
      
      const { data: dbSprints, error: dbError } = await query;
      
      if (dbError) {
        console.error('Error fetching sprints from database:', dbError);
        throw dbError;
      }
      
      // If we have sprints from the database, use those
      if (dbSprints && dbSprints.length > 0) {
        console.log(`Successfully loaded ${dbSprints.length} sprints from database:`, dbSprints);
        setSprints(dbSprints);
        
        // Load tasks for these sprints
        const sprintIds = dbSprints.map(sprint => sprint.id);
        const taskData = await TaskService.getTasksBySprintIds(sprintIds);
        setTasks(taskData);
        
        if (showLoading) {
          setLoading(false);
        }
        return dbSprints;
      }
      
      // If no database sprints found, provide demo sprints
      console.log("No sprints found in database, generating demo sprints");
      const demoSprints = getDemoSprints(projectId);
      setSprints(demoSprints);
      
      // Set demo tasks
      const demoTasks = getDemoTasks(demoSprints);
      setTasks(demoTasks);
      
      return demoSprints;
    } catch (err) {
      console.error("Error loading sprints:", err);
      setError(err);
      // Return empty array to prevent further errors
      return [];
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [projectId, viewCurrent]);
  
  return {
    sprints,
    setSprints,
    tasks,
    setTasks,
    loading,
    error,
    loadSprints
  };
}

// Helper function to get demo sprints
function getDemoSprints(projectId) {
  const today = new Date();
  const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  return [
    {
      id: 1001,
      name: "Sprint 1",
      description: "First sprint of the project",
      goal: "Establish project foundations",
      start_date: twoWeeksAgo.toISOString(),
      end_date: today.toISOString(),
      status: "completed",
      progress: 100,
      tasks_completed: 8,
      tasks_total: 8,
      story_points: 21,
      project_id: projectId || "demo-project-1",
      created_at: twoWeeksAgo.toISOString()
    },
    {
      id: 1002,
      name: "Current Sprint",
      description: "Active development sprint",
      goal: "Implement core features",
      start_date: today.toISOString(),
      end_date: twoWeeksFromNow.toISOString(),
      status: "active",
      progress: 40,
      tasks_completed: 4,
      tasks_total: 10,
      story_points: 34,
      project_id: projectId || "demo-project-1",
      created_at: today.toISOString()
    }
  ];
}

// Helper function to get demo tasks
function getDemoTasks(sprints) {
  const tasks = [];
  
  // Add tasks for each sprint
  sprints.forEach(sprint => {
    if (sprint.id === 1001) {
      // Completed sprint tasks
      for (let i = 1; i <= 8; i++) {
        tasks.push({
          id: `task-${sprint.id}-${i}`,
          title: `Task ${i} for ${sprint.name}`,
          description: `Description for task ${i} in ${sprint.name}`,
          status: "done",
          priority: i % 3 === 0 ? "high" : i % 2 === 0 ? "medium" : "low",
          sprint_id: sprint.id,
          story_points: i % 5 + 1,
          created_at: sprint.start_date
        });
      }
    } else if (sprint.id === 1002) {
      // Active sprint tasks - mix of done and in progress
      for (let i = 1; i <= 10; i++) {
        tasks.push({
          id: `task-${sprint.id}-${i}`,
          title: `Task ${i} for ${sprint.name}`,
          description: `Description for task ${i} in ${sprint.name}`,
          status: i <= 4 ? "done" : i <= 7 ? "in_progress" : "todo",
          priority: i % 3 === 0 ? "high" : i % 2 === 0 ? "medium" : "low",
          sprint_id: sprint.id,
          story_points: i % 8 + 1,
          created_at: sprint.start_date
        });
      }
    }
  });
  
  return tasks;
}

export default useSprintLoading;
