
import { useState, useEffect, useCallback } from "react";
import { useFetchData } from "@/hooks/useFetchData";
import { toast } from "@/hooks/use-toast";

export const useProjectSelection = (initialProjectId, isEditing) => {
  const [projectId, setProjectId] = useState(initialProjectId || null);
  const [projects, setProjects] = useState([]);
  const { fetchAll: fetchProjects, isLoading, error: projectsError } = useFetchData("projects");

  // Create a default demo project if no projects exist
  const createDefaultProject = useCallback(async () => {
    try {
      console.log("Creating default demo project");
      
      // Default project data
      const defaultProject = {
        id: "demo-project-1",
        name: "Demo Project", 
        description: "This is a demo project that was automatically created",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Add the default project to the projects list
      setProjects(prev => {
        // Check if the default project already exists
        if (prev.some(p => p.id === "demo-project-1")) {
          return prev;
        }
        return [defaultProject, ...prev];
      });
      
      // Select the default project
      if (!projectId) {
        setProjectId("demo-project-1");
        localStorage.setItem("selectedProjectId", "demo-project-1");
      }
      
      return defaultProject;
    } catch (error) {
      console.error("Error creating default project:", error);
      return null;
    }
  }, [projectId]);

  // Load projects with better error handling
  const loadProjects = useCallback(async () => {
    try {
      console.log("Fetching projects...");
      const projectsData = await fetchProjects({
        orderBy: { column: "created_at", ascending: false }
      });
      
      // Check if we got any projects from the database
      if (projectsData && projectsData.length > 0) {
        console.log("Projects loaded from DB:", projectsData.length);
        setProjects(projectsData);
        
        // Only auto-select a project if:
        // 1. We don't already have a selected project AND
        // 2. We're not in editing mode AND
        // 3. We actually have projects
        if (!projectId && projectsData && projectsData.length > 0 && !isEditing) {
          // Try to get project from local storage first
          const storedProjectId = localStorage.getItem("selectedProjectId");
          
          if (storedProjectId && projectsData.some(p => p.id === storedProjectId)) {
            console.log("Using stored project ID:", storedProjectId);
            setProjectId(storedProjectId);
          } else {
            // Fall back to first project
            console.log("Setting default project ID:", projectsData[0].id);
            setProjectId(projectsData[0].id);
            localStorage.setItem("selectedProjectId", projectsData[0].id);
          }
        }
      } else {
        // No projects found, create a default one
        console.log("No projects found, creating default project");
        await createDefaultProject();
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      
      // Show error toast only once
      toast({
        title: "Error loading projects",
        description: "Creating a demo project instead",
        variant: "destructive",
      });
      
      // Create a default project on error
      await createDefaultProject();
    }
  }, [fetchProjects, isEditing, projectId, createDefaultProject]);

  // Set up project selection change handler
  const handleProjectChange = (newProjectId) => {
    console.log("Project selection changed to:", newProjectId);
    
    // Handle null or undefined values properly
    if (newProjectId === "" || newProjectId === undefined) {
      return; // Don't update if empty string or undefined
    }
    
    // Handle the "no-project" value by creating a default project
    if (newProjectId === "no-project") {
      createDefaultProject().then(project => {
        if (project) {
          setProjectId(project.id);
          localStorage.setItem("selectedProjectId", project.id);
        }
      });
      return;
    }
    
    // Only update if it's different to avoid unnecessary re-renders
    if (newProjectId !== projectId) {
      setProjectId(newProjectId);
      
      // Save selected project to localStorage if it's valid
      if (newProjectId && projects.some(p => p.id === newProjectId)) {
        localStorage.setItem("selectedProjectId", newProjectId);
        console.log("Saved project selection to localStorage:", newProjectId);
      }
    }
  };
  
  // Load projects on component mount
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projectId,
    setProjectId: handleProjectChange,
    projects,
    isLoading,
    error: projectsError,
    refreshProjects: loadProjects
  };
};
