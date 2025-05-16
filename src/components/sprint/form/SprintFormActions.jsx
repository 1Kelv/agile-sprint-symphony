
import React from "react";
import { Button } from "@/components/ui/button";

const SprintFormActions = ({ 
  handleClose, 
  isSubmitting, 
  isLoading, 
  isEditing,
  isViewMode
}) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleClose}
        disabled={isSubmitting}
      >
        {isViewMode ? "Close" : "Cancel"}
      </Button>
      
      {!isViewMode && (
        <Button 
          type="submit" 
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Sprint" : "Create Sprint"}
        </Button>
      )}
    </div>
  );
};

export default SprintFormActions;
