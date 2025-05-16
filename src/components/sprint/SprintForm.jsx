
import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useSprintForm } from "@/components/sprint/form/useSprintForm";
import SprintFormFields from "@/components/sprint/form/SprintFormFields";

export function SprintForm({
  open,
  onOpenChange,
  sprint = null,
  initialData = null,
  onSuccess,
}) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [preventMultipleSubmit, setPreventMultipleSubmit] = useState(false);
  const formSubmittedRef = useRef(false);
  const dialogOpenedAt = useRef(Date.now());
  
  // Use our custom hook for form state and submission logic
  const {
    name,
    setName,
    description,
    setDescription,
    goal,
    setGoal,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    status,
    setStatus,
    projectId,
    setProjectId,
    projects,
    refreshProjects,
    errors,
    isSubmitting,
    isLoading,
    hasSubmitted,
    handleSubmit
  } = useSprintForm(sprint || initialData, () => onOpenChange(false), onSuccess);

  // Synchronize the open state
  useEffect(() => {
    setIsOpen(open);
    // Reset submission flag when opening the form
    if (open) {
      formSubmittedRef.current = false;
      setPreventMultipleSubmit(false);
      dialogOpenedAt.current = Date.now();
    }
  }, [open]);
  
  // Ensure projects are loaded when the form opens
  useEffect(() => {
    if (isOpen) {
      refreshProjects();
    }
  }, [isOpen, refreshProjects]);

  // Handle dialog close with confirmation if form has changes
  const handleOpenChange = (newOpen) => {
    if (!newOpen) {
      // Always allow closing
      setIsOpen(false);
      if (onOpenChange) onOpenChange(false);
    } else {
      setIsOpen(true);
      if (onOpenChange) onOpenChange(true);
    }
  };

  // Determine if this is view-only mode
  const isViewMode = sprint === null && initialData !== null;
  
  // Enhanced form submission with more robust prevention of duplicate submissions
  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Prevent form submission within 500ms of opening dialog
    // This prevents accidental double-click submissions
    if (Date.now() - dialogOpenedAt.current < 500) {
      console.log("Preventing submission too soon after opening dialog");
      return;
    }
    
    // Multiple checks to prevent duplicate submissions
    if (preventMultipleSubmit || isSubmitting || isLoading || hasSubmitted || formSubmittedRef.current) {
      console.log("Preventing duplicate form submission");
      return;
    }
    
    // Set flags to prevent multiple submissions
    setPreventMultipleSubmit(true);
    formSubmittedRef.current = true;
    
    // Submit the form
    console.log("Submitting form with data:", { name, description, goal, startDate, endDate, status, projectId });
    handleSubmit(e).finally(() => {
      // Reset flags after a delay
      setTimeout(() => {
        setPreventMultipleSubmit(false);
        // Keep formSubmittedRef.current true to prevent further submissions
      }, 2000);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {sprint ? "Edit Sprint" : initialData ? "Sprint Details" : "Create New Sprint"}
          </DialogTitle>
          <DialogDescription>
            {sprint
              ? "Update the details of your existing sprint."
              : initialData
              ? "View the details of this sprint."
              : "Add a new sprint to organize your team's work."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6" id="sprint-form">
          <SprintFormFields
            name={name}
            setName={setName}
            description={description}
            setDescription={setDescription}
            goal={goal}
            setGoal={setGoal}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            status={status}
            setStatus={setStatus}
            projectId={projectId}
            setProjectId={setProjectId}
            projects={projects}
            errors={errors}
            isViewMode={isViewMode}
          />

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            {!isViewMode && (
              <Button 
                type="submit" 
                form="sprint-form"
                disabled={isSubmitting || isLoading || preventMultipleSubmit || hasSubmitted}
              >
                {isSubmitting || isLoading
                  ? "Saving..."
                  : sprint
                  ? "Update Sprint"
                  : "Create Sprint"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default SprintForm;
