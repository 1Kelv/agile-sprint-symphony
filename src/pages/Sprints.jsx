
import React, { useEffect, useCallback, useState, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import SprintForm from "@/components/sprint/SprintForm";
import SprintsList from "@/components/sprint/SprintsList";
import DeleteSprintDialog from "@/components/sprint/DeleteSprintDialog";
import { useSprints } from "@/hooks/sprint/useSprints";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const Sprints = ({ viewCurrent = false }) => {
  const { user } = useAuth();
  const params = useParams();
  const location = useLocation();
  const projectId = params.projectId || null;
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [formSubmitInProgress, setFormSubmitInProgress] = useState(false);
  const createButtonClickedRef = useRef(false);
  
  const {
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
  } = useSprints(projectId, viewCurrent);
  
  // Mark initial load complete after a delay
  useEffect(() => {
    let isMounted = true;
    // Set a timer that triggers after content is visible to avoid flicker
    const timer = setTimeout(() => {
      if (isMounted) {
        setInitialLoadComplete(true);
      }
    }, 300);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);
  
  // Use useCallback to improve performance and prevent unnecessary re-renders
  const refreshSprints = useCallback(() => {
    if (initialLoadComplete) {
      console.log("Refreshing sprints data...");
      loadSprints(false); // No loading state to avoid flicker
    }
  }, [loadSprints, initialLoadComplete]);
  
  // Only refresh when params change and initial load is complete
  useEffect(() => {
    if (initialLoadComplete) {
      refreshSprints();
    }
  }, [projectId, viewCurrent, refreshSprints, initialLoadComplete]);
  
  const handleCreateButtonClick = (e) => {
    // Prevent duplicate clicks
    if (createButtonClickedRef.current || formSubmitInProgress || isFormOpen) {
      console.log("Create button action ignored - already processing");
      return;
    }
    
    createButtonClickedRef.current = true;
    console.log("Create button clicked");
    
    // Call the create sprint handler
    handleCreateSprint();
    
    // Reset the flag after a delay
    setTimeout(() => {
      createButtonClickedRef.current = false;
    }, 1000);
  };
  
  // Handle sprint save success
  const handleSprintSaveSuccess = useCallback((sprintData) => {
    if (formSubmitInProgress) {
      console.log("Form submission already in progress, ignoring duplicate");
      return;
    }
    
    console.log("Sprint save success with data:", sprintData);
    setFormSubmitInProgress(true);
    
    try {
      // Process the save
      const savedSprint = handleSaveSprint(sprintData);
      
      if (savedSprint) {
        // Close the form
        setIsFormOpen(false);
        
        // Refresh after a delay
        setTimeout(() => {
          refreshSprints();
          setFormSubmitInProgress(false);
        }, 300);
      } else {
        // Handle error case
        setFormSubmitInProgress(false);
      }
    } catch (err) {
      console.error("Error in sprint save success handler:", err);
      setFormSubmitInProgress(false);
      
      toast({
        title: "Error",
        description: "Failed to save sprint. Please try again.",
        variant: "destructive",
      });
    }
  }, [handleSaveSprint, refreshSprints, setIsFormOpen, formSubmitInProgress]);

  // Handle form close
  const handleFormOpenChange = (open) => {
    if (!open) {
      console.log("Closing sprint form");
      handleCloseForm();
    }
    setIsFormOpen(open);
  };

  // Show proper loading state only on initial load with reduced flicker
  if (!initialLoadComplete || (loading && !sprints?.length)) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-64 rounded-lg" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">
            {viewCurrent ? "Current Sprints" : (projectId ? "Project Sprints" : "All Sprints")}
          </h1>
          <Button 
            onClick={handleCreateButtonClick}
            disabled={formSubmitInProgress || isFormOpen}
            data-testid="create-sprint-btn"
            className="transition-all duration-300"
          >
            Create Sprint
          </Button>
        </div>

        <SprintsList
          sprints={sprints || []}
          tasks={tasks || []}
          loading={false} // We handle loading at the page level
          error={error}
          loadSprints={refreshSprints}
          onEdit={handleEditSprint}
          onView={handleViewSprint}
          onDelete={handleDeleteSprint}
          onCreate={handleCreateButtonClick}
        />
      </div>

      {isFormOpen && (
        <SprintForm
          open={isFormOpen}
          onOpenChange={handleFormOpenChange}
          sprint={isEditing ? selectedSprint : null}
          initialData={!isEditing && selectedSprint ? selectedSprint : null}
          onSuccess={handleSprintSaveSuccess}
        />
      )}

      <DeleteSprintDialog 
        open={!!sprintToDelete} 
        onOpenChange={(open) => !open && setSprintToDelete(null)}
        onConfirm={confirmDeleteSprint}
      />
    </Layout>
  );
};

export default Sprints;
