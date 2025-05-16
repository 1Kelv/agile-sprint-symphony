
import { useState, useEffect, useRef } from "react";
import { toast } from "@/components/ui/use-toast";
import { useSprintValidation } from "./useSprintValidation";
import { useProjectSelection } from "./useProjectSelection";

export const useSprintForm = (sprint, handleClose, onSuccess) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)); // Default to 2 weeks
  const [status, setStatus] = useState("planned");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const formSubmissionAttempts = useRef(0);
  
  // Use our extracted validation hook
  const { errors, setErrors, validateForm } = useSprintValidation();
  
  // Use our extracted project selection hook - with default demo project
  const { projectId, setProjectId, projects, refreshProjects } = useProjectSelection(
    sprint?.project_id || "demo-project-1",
    !!sprint
  );
  
  // Initialize form with sprint data if editing
  useEffect(() => {
    if (sprint) {
      console.log("Initializing form with data:", sprint);
      setName(sprint.name || "");
      setDescription(sprint.description || "");
      setGoal(sprint.goal || "");
      setStartDate(sprint.start_date ? new Date(sprint.start_date) : new Date());
      setEndDate(sprint.end_date ? new Date(sprint.end_date) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
      setProjectId(sprint.project_id || "demo-project-1");
      setStatus(sprint.status || "planned");
    } else {
      // Reset to defaults for new sprint
      setStatus("planned");
      setProjectId("demo-project-1"); // Default project ID for demo
    }
    
    // Force refresh of projects on mount
    refreshProjects();
    
    // Reset submission state when form is opened
    setHasSubmitted(false);
    setIsSubmitting(false);
    setIsLoading(false);
    formSubmissionAttempts.current = 0;
  }, [sprint, setProjectId, refreshProjects]);

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    // Track submission attempts and prevent excessive submissions
    formSubmissionAttempts.current += 1;
    console.log(`Sprint form submission attempt: ${formSubmissionAttempts.current}`);
    
    // Clear any previous validation errors
    setErrors({});
    
    // Strict checks to prevent multiple submissions
    if (isSubmitting || isLoading || hasSubmitted || formSubmissionAttempts.current > 1) {
      console.log("Form submission prevented - already submitting, loading, or submitted");
      return;
    }
    
    console.log("Form submitted with:", { name, description, goal, startDate, endDate, projectId, status });
    
    // Ensure we have a project ID - if not, create and use the default one
    const effectiveProjectId = projectId || "demo-project-1";
    
    // Create validation payload with original status for transition rules
    const validationPayload = {
      name, 
      startDate, 
      endDate, 
      projectId: effectiveProjectId,
      status,
      // Include the ID and original status if editing an existing sprint
      ...(sprint && { 
        id: sprint.id,
        originalStatus: sprint.status
      })
    };

    if (!validateForm(validationPayload)) {
      console.log("Validation failed with errors:", errors);
      formSubmissionAttempts.current = 0; // Reset attempts counter on validation error
      return;
    }

    setIsSubmitting(true);
    setIsLoading(true);
    setHasSubmitted(true);

    try {
      // Build a sprint payload with only the fields we know exist in the database
      const sprintPayload = {
        name,
        description: description || null,
        goal: goal || null,
        start_date: startDate,
        end_date: endDate,
        status: status || "planned",
        project_id: effectiveProjectId,
      };

      console.log("Sprint payload:", sprintPayload);

      // Call success callback with the sprint payload
      if (onSuccess) {
        console.log("Calling onSuccess callback with data:", sprintPayload);
        onSuccess(sprintPayload);
      }
      
      // Reset form errors
      setErrors({});
      
      // Close the form
      if (handleClose) {
        console.log("Closing form via handleClose");
        handleClose();
      }
      
      return true;
    } catch (error) {
      console.error("Error saving sprint:", error);
      
      // Show only a single error toast
      toast({
        title: "Error",
        description: "There was a problem saving the sprint. Please try again.",
        variant: "destructive",
      });
      
      // Reset submission state on error to allow retry
      setHasSubmitted(false);
      setIsSubmitting(false);
      setIsLoading(false);
      formSubmissionAttempts.current = 0;
      
      return false;
    } finally {
      // If we get here and submission didn't reset, make sure we clean up
      setTimeout(() => {
        console.log("Resetting submission state via timeout safety");
        setIsSubmitting(false);
        setIsLoading(false);
      }, 5000); // Safety timeout
    }
  };

  return {
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
  };
};
