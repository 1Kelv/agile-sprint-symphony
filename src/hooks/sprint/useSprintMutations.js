
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useSprintMutations(loadSprints, setSprints) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Save (create or update) a sprint
  const handleSaveSprint = async (data, isEditing = false, selectedSprint = null) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Saving sprint data:", data);
      console.log("Is editing:", isEditing);
      console.log("Selected sprint:", selectedSprint);

      // Format dates
      const formattedData = { 
        ...data,
        start_date: data.start_date ? new Date(data.start_date).toISOString() : null,
        end_date: data.end_date ? new Date(data.end_date).toISOString() : null
      };

      let result;
      
      if (isEditing && selectedSprint) {
        console.log("Updating sprint with ID:", selectedSprint.id);
        const { data: updatedSprint, error } = await supabase
          .from('sprints')
          .update(formattedData)
          .eq('id', selectedSprint.id)
          .select()
          .single();
          
        if (error) throw error;
        result = updatedSprint;
        console.log("Sprint updated successfully:", updatedSprint);
        
        toast({
          title: "Sprint updated",
          description: `${formattedData.name} has been updated successfully`,
        });
      } else {
        console.log("Creating new sprint");
        const { data: newSprint, error } = await supabase
          .from('sprints')
          .insert(formattedData)
          .select()
          .single();
          
        if (error) throw error;
        result = newSprint;
        console.log("Sprint created successfully:", newSprint);
        
        toast({
          title: "Sprint created",
          description: `${formattedData.name} has been created successfully`,
        });
      }
      
      // Reload sprints to update the UI with the latest data
      await loadSprints(false);
      
      return result;
    } catch (err) {
      console.error("Error saving sprint:", err);
      setError(err);
      
      toast({
        title: "Error saving sprint",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a sprint
  const confirmDeleteSprint = async (sprintId) => {
    if (!sprintId) return false;
    
    try {
      setIsLoading(true);
      setError(null);

      console.log("Deleting sprint with ID:", sprintId);
      const { error } = await supabase.from('sprints').delete().eq('id', sprintId);

      if (error) throw error;
      
      // Update UI by removing the deleted sprint
      setSprints(prevSprints => prevSprints.filter(sprint => sprint.id !== sprintId));
      
      toast({
        title: "Sprint deleted",
        description: "The sprint has been successfully deleted",
      });
      
      console.log("Sprint deleted successfully");
      return true;
    } catch (err) {
      console.error("Error deleting sprint:", err);
      setError(err);
      
      toast({
        title: "Error deleting sprint",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSaveSprint,
    confirmDeleteSprint,
    isLoading,
    error
  };
}
