
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export class ProjectService {
  /**
   * Fetch all projects
   */
  static async getProjects() {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        toast({
          title: "Error fetching projects",
          variant: "destructive",
        });
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching projects:", error);
      return [];
    }
  }
  
  /**
   * Fetch a project by ID
   */
  static async getProject(id) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*, project_members(user_id, role)")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching project:", error);
        toast({
          title: "Error fetching project",
          variant: "destructive",
        });
        return null;
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching project:", error);
      return null;
    }
  }
  
  /**
   * Create a new project
   */
  static async createProject(project) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([project])
        .select()
        .single();

      if (error) {
        console.error("Error creating project:", error);
        toast({
          title: "Error creating project",
          variant: "destructive",
        });
        return null;
      }
      
      // Add the creator as a project admin
      const { error: memberError } = await supabase
        .from("project_members")
        .insert({
          project_id: data.id,
          user_id: data.owner_id,
          role: "admin"
        });
        
      if (memberError) {
        console.error("Error adding project member:", memberError);
      }
      
      toast({
        title: "Project created",
        description: "Project has been created successfully.",
      });
      
      return data;
    } catch (error) {
      console.error("Error creating project:", error);
      return null;
    }
  }
  
  /**
   * Update a project
   */
  static async updateProject(id, updates) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Error updating project:", error);
        toast({
          title: "Error updating project",
          variant: "destructive",
        });
        return null;
      }
      
      toast({
        title: "Project updated",
        description: "Project has been updated successfully.",
      });
      
      return data;
    } catch (error) {
      console.error("Error updating project:", error);
      return null;
    }
  }
  
  /**
   * Delete a project
   */
  static async deleteProject(id) {
    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting project:", error);
        toast({
          title: "Error deleting project",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Project deleted",
        description: "Project has been deleted successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting project:", error);
      return false;
    }
  }
  
  /**
   * Add a member to a project
   */
  static async addProjectMember(projectId, userId, role = "developer") {
    try {
      const { data, error } = await supabase
        .from("project_members")
        .insert({
          project_id: projectId,
          user_id: userId,
          role
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding project member:", error);
        toast({
          title: "Error adding team member",
          variant: "destructive",
        });
        return null;
      }
      
      toast({
        title: "Team member added",
        description: "Team member has been added to the project.",
      });
      
      return data;
    } catch (error) {
      console.error("Error adding project member:", error);
      return null;
    }
  }
  
  /**
   * Remove a member from a project
   */
  static async removeProjectMember(projectId, userId) {
    try {
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error removing project member:", error);
        toast({
          title: "Error removing team member",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Team member removed",
        description: "Team member has been removed from the project.",
      });
      
      return true;
    } catch (error) {
      console.error("Error removing project member:", error);
      return false;
    }
  }
  
  /**
   * Get all sprints for a project
   */
  static async getProjectSprints(projectId) {
    try {
      const { data, error } = await supabase
        .from("sprints")
        .select("*")
        .eq("project_id", projectId)
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching project sprints:", error);
        return [];
      }
      
      return data;
    } catch (error) {
      console.error("Error fetching project sprints:", error);
      return [];
    }
  }
}

export default ProjectService;
