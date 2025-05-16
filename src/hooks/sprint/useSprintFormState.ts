
import { useState, useCallback } from 'react';

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

export function useSprintFormState() {
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState<number | null>(null);

  // Function to open the create form
  const handleCreateSprint = useCallback(() => {
    setSelectedSprint(null);
    setIsEditing(false);
    setIsFormOpen(true);
  }, []);

  // Function to open the edit form for a specific sprint
  const handleEditSprint = useCallback((sprint: Sprint) => {
    setSelectedSprint(sprint);
    setIsEditing(true);
    setIsFormOpen(true);
  }, []);

  // Function to view a specific sprint
  const handleViewSprint = useCallback((sprint: Sprint) => {
    setSelectedSprint(sprint);
    setIsEditing(false);
  }, []);

  // Function to close the form
  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setTimeout(() => {
      setSelectedSprint(null);
      setIsEditing(false);
    }, 300);
  }, []);
  
  // Function to confirm delete a sprint
  const handleDeleteSprint = useCallback((sprintId: number) => {
    setSprintToDelete(sprintId);
  }, []);
  
  return {
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
  };
}

export default useSprintFormState;
