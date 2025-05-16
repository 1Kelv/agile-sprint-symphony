
import { supabase } from "@/integrations/supabase/client";

class TaskService {
  /**
   * Get tasks for specific sprint IDs
   */
  static async getTasksBySprintIds(sprintIds) {
    try {
      if (!sprintIds || sprintIds.length === 0) {
        return [];
      }
      
      // Convert all IDs to numbers for consistency
      const normalizedIds = sprintIds.map(id => Number(id));
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .in('sprint_id', normalizedIds);
      
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getTasksBySprintIds:', error);
      return [];
    }
  }
  
  /**
   * Get tasks for a specific sprint
   */
  static async getTasksBySprintId(sprintId) {
    if (!sprintId) return [];
    return this.getTasksBySprintIds([sprintId]);
  }
  
  /**
   * Get all tasks
   */
  static async getAllTasks() {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching all tasks:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getAllTasks:', error);
      return [];
    }
  }

  /**
   * Create a new task
   */
  static async createTask(taskData) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select();
      
      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Error in createTask:', error);
      return null;
    }
  }

  /**
   * Update an existing task
   */
  static async updateTask(taskId, taskData) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', taskId)
        .select();
      
      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Error in updateTask:', error);
      return null;
    }
  }
}

export default TaskService;
