
import { useState, useCallback } from "react";

export const useSprintValidation = () => {
  const [errors, setErrors] = useState({});

  const validateForm = useCallback((data) => {
    const newErrors = {};
    let isValid = true;

    // Validate required fields
    if (!data.name || data.name.trim() === "") {
      newErrors.name = "Sprint name is required";
      isValid = false;
    }

    if (!data.startDate) {
      newErrors.startDate = "Start date is required";
      isValid = false;
    }

    if (!data.endDate) {
      newErrors.endDate = "End date is required";
      isValid = false;
    }

    // Validate date logic (end date must be after start date)
    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      newErrors.endDate = "End date must be after start date";
      isValid = false;
    }

    // Validate project is selected
    if (!data.projectId) {
      newErrors.projectId = "Project selection is required";
      isValid = false;
    }

    // Validate status transitions if editing an existing sprint
    if (data.id && data.originalStatus && data.status !== data.originalStatus) {
      const validTransitions = {
        planned: ["active", "cancelled"],
        active: ["completed", "cancelled"],
        completed: [],
        cancelled: ["planned"]
      };

      if (!validTransitions[data.originalStatus]?.includes(data.status)) {
        newErrors.status = `Cannot change status from ${data.originalStatus} to ${data.status}`;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  }, []);

  return {
    errors,
    setErrors,
    validateForm
  };
};
