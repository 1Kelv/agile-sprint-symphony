
import { supabase } from "@/integrations/supabase/client";

class SprintService {
  /**
   * Get all sprints with optional filtering
   */
  static async getAllSprints(filters) {
    try {
      let query = supabase
        .from('sprints')
        .select('*');
      
      // Apply filters if provided
      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in('status', filters.status);
        } else {
          query = query.eq('status', filters.status);
        }
      }
      
      if (filters?.project_id) {
        query = query.eq('project_id', filters.project_id);
      }
      
      // Add default ordering
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching sprints:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAllSprints:', error);
      return [];
    }
  }
  
  /**
   * Get a specific sprint by ID
   */
  static async getSprintById(sprintId) {
    if (!sprintId) return null;
    
    try {
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('id', sprintId)
        .single();
      
      if (error) {
        console.error(`Error fetching sprint ${sprintId}:`, error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Error in getSprintById for sprint ${sprintId}:`, error);
      return null;
    }
  }
  
  /**
   * Get the currently active sprint
   */
  static async getCurrentSprint() {
    try {
      const today = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('sprints')
        .select('*')
        .eq('status', 'active')
        .lte('start_date', today)
        .gte('end_date', today)
        .order('end_date', { ascending: true })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is the "no rows returned" error
        console.error('Error fetching current sprint:', error);
        return null;
      }
      
      if (!data) {
        // If no active sprint found in the current date range,
        // return the most recent active sprint
        const { data: activeSprints, error: activeError } = await supabase
          .from('sprints')
          .select('*')
          .eq('status', 'active')
          .order('end_date', { ascending: false })
          .limit(1)
          .single();
          
        if (activeError && activeError.code !== 'PGRST116') {
          console.error('Error fetching active sprint:', activeError);
        }
        
        return activeSprints || null;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getCurrentSprint:', error);
      return null;
    }
  }
  
  /**
   * Create a new sprint
   */
  static async createSprint(sprintData) {
    try {
      // Ensure dates are properly formatted as strings
      const formattedData = {
        ...sprintData,
        start_date: typeof sprintData.start_date === 'object' ? 
          sprintData.start_date.toISOString() : sprintData.start_date,
        end_date: typeof sprintData.end_date === 'object' ? 
          sprintData.end_date.toISOString() : sprintData.end_date
      };
      
      const { data, error } = await supabase
        .from('sprints')
        .insert(formattedData)
        .select();
      
      if (error) {
        console.error('Error creating sprint:', error);
        throw error;
      }
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Error in createSprint:', error);
      throw error;
    }
  }
  
  /**
   * Update an existing sprint
   */
  static async updateSprint(sprintId, sprintData) {
    try {
      // Ensure sprintId is a number
      const id = typeof sprintId === 'string' ? parseInt(sprintId, 10) : sprintId;
      
      // Format dates if they exist
      const formattedData = { ...sprintData };
      
      if (formattedData.start_date && typeof formattedData.start_date === 'object') {
        formattedData.start_date = formattedData.start_date.toISOString();
      }
      
      if (formattedData.end_date && typeof formattedData.end_date === 'object') {
        formattedData.end_date = formattedData.end_date.toISOString();
      }
      
      const { data, error } = await supabase
        .from('sprints')
        .update(formattedData)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error(`Error updating sprint ${sprintId}:`, error);
        throw error;
      }
      
      return data?.[0] || null;
    } catch (error) {
      console.error(`Error in updateSprint for sprint ${sprintId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a sprint
   */
  static async deleteSprint(sprintId) {
    try {
      // Ensure sprintId is a number
      const id = typeof sprintId === 'string' ? parseInt(sprintId, 10) : sprintId;
      
      const { error } = await supabase
        .from('sprints')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting sprint ${sprintId}:`, error);
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Error in deleteSprint for sprint ${sprintId}:`, error);
      throw error;
    }
  }
  
  /**
   * Update sprint progress
   */
  static async updateSprintProgress(sprintId, progress, tasksCompleted, tasksTotal) {
    try {
      const { error } = await supabase
        .from('sprints')
        .update({
          progress,
          tasks_completed: tasksCompleted,
          tasks_total: tasksTotal
        })
        .eq('id', sprintId);
      
      if (error) {
        console.error(`Error updating sprint ${sprintId} progress:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Error in updateSprintProgress for sprint ${sprintId}:`, error);
      return false;
    }
  }
  
  /**
   * Get sprints with options
   */
  static async getSprints(options = {}) {
    try {
      let query = supabase.from('sprints').select('*');
      
      // Apply filters if provided
      if (options.filters && Array.isArray(options.filters)) {
        options.filters.forEach(filter => {
          if (filter.operator === 'eq') {
            query = query.eq(filter.column, filter.value);
          } else if (filter.operator === 'in') {
            query = query.in(filter.column, filter.value);
          }
        });
      }
      
      // Apply ordering
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending
        });
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching sprints:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getSprints:', error);
      return [];
    }
  }
}

export default SprintService;
