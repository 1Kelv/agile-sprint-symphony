
import { useEffect } from "react";
import { useSprintLoading } from "./useSprintLoading";
import { useSprintFormState } from "./useSprintFormState";
import { useSprintMutations } from "./useSprintMutations";
import { toast } from "@/hooks/use-toast";

export function useSprints(projectId = null, viewCurrent = false) {
  // Use our custom hooks to manage different aspects of sprint functionality
  const {
    sprints, setSprints, tasks, loading, error, loadSprints
  } = useSprintLoading(projectId, viewCurrent);

  const {
    selectedSprint, 
    setSelectedSprint, 
    isFormOpen, 
    setIsFormOpen, 
    isEditing, 
    setIsEditing, 
    sprintToDelete, 
    setSprintToDelete, 
    handleCreateSprint, 
    handleEditSprint, 
    handleViewSprint, 
    handleCloseForm, 
    handleDeleteSprint
  } = useSprintFormState();

  const {
    handleSaveSprint: saveSprint,
    confirmDeleteSprint: deleteSprint
  } = useSprintMutations(loadSprints, setSprints);

  // Load initial data
  useEffect(() => {
    console.log("Initial sprint load triggered");
    loadSprints(true);
  }, [loadSprints]);

  // Wrapper functions to connect state and mutations
  const handleSaveSprint = async (sprintData) => {
    const success = await saveSprint(sprintData, isEditing, selectedSprint);
    
    if (success) {
      setIsFormOpen(false);
      // Reload sprints to reflect the changes
      await loadSprints(false);
      
      // Reset form state
      setTimeout(() => {
        setSelectedSprint(null);
        setIsEditing(false);
      }, 300);

      toast({
        title: isEditing ? "Sprint updated" : "Sprint created",
        description: `${sprintData.name} has been ${isEditing ? 'updated' : 'created'} successfully`,
      });
    }
    
    return success;
  };

  const confirmDeleteSprint = async () => {
    const success = await deleteSprint(sprintToDelete);
    
    if (success) {
      setSprintToDelete(null);
      // Reload sprints to reflect the changes
      await loadSprints(false);
    }
    
    return success;
  };

  return {
    sprints,
    tasks,
    loading,
    error,
    selectedSprint,
    isFormOpen,
    isEditing,
    sprintToDelete,
    setIsFormOpen,
    setSprintToDelete,
    handleCreateSprint,
    handleEditSprint,
    handleViewSprint,
    handleDeleteSprint,
    confirmDeleteSprint,
    handleCloseForm,
    handleSaveSprint,
    loadSprints
  };
}

export default useSprints;
