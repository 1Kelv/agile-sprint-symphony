
import { useState, useCallback } from "react";

export function useSprintFormState() {
  const [selectedSprint, setSelectedSprint] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sprintToDelete, setSprintToDelete] = useState(null);

  // Handle form actions
  const handleCreateSprint = useCallback(() => {
    console.log("Creating new sprint");
    setSelectedSprint(null);
    setIsEditing(false);
    setIsFormOpen(true);
  }, []);

  const handleEditSprint = useCallback((sprint) => {
    console.log("Editing sprint:", sprint);
    setSelectedSprint(sprint);
    setIsEditing(true);
    setIsFormOpen(true);
  }, []);

  const handleViewSprint = useCallback((sprint) => {
    console.log("Viewing sprint details:", sprint);
    setSelectedSprint(sprint);
    setIsEditing(false);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    console.log("Closing sprint form");
    setIsFormOpen(false);
    // Wait a moment before resetting selected sprint to avoid UI flicker
    setTimeout(() => {
      setSelectedSprint(null);
      setIsEditing(false);
    }, 300);
  }, []);

  const handleDeleteSprint = useCallback((sprint) => {
    if (!sprint) return;
    console.log("Setting sprint to delete:", sprint);
    setSprintToDelete(sprint);
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
