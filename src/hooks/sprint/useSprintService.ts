
import { useCallback, useState } from 'react';
import { toast } from "@/hooks/use-toast";
import SprintService from "@/services/SprintService";

/**
 * Custom hook to interact with the SprintService
 * This separates UI concerns from data fetching logic
 */
export const useSprintService = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSprints = useCallback(async (options?: any) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await SprintService.getSprints(options);
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error fetching sprints');
      console.error('Error fetching sprints:', error);
      setError(error);
      toast({
        title: "Error loading sprints",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentSprint = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await SprintService.getCurrentSprint();
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error fetching current sprint');
      console.error('Error fetching current sprint:', error);
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSprint = useCallback(async (sprintData: any, isEditing: boolean, sprintId?: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Format dates if they exist
      const formattedData = { ...sprintData };
      
      if (formattedData.start_date && formattedData.start_date instanceof Date) {
        formattedData.start_date = formattedData.start_date.toISOString();
      }
      
      if (formattedData.end_date && formattedData.end_date instanceof Date) {
        formattedData.end_date = formattedData.end_date.toISOString();
      }
      
      let result;
      
      if (isEditing && sprintId) {
        result = await SprintService.updateSprint(sprintId, formattedData);
      } else {
        result = await SprintService.createSprint(formattedData);
      }
      
      toast({
        title: isEditing ? "Sprint updated" : "Sprint created",
        description: `${formattedData.name} has been ${isEditing ? 'updated' : 'created'} successfully`,
      });
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error saving sprint');
      console.error('Error saving sprint:', error);
      setError(error);
      
      toast({
        title: "Error saving sprint",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSprint = useCallback(async (sprintId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await SprintService.deleteSprint(sprintId);
      
      toast({
        title: "Sprint deleted",
        description: "The sprint has been successfully deleted",
      });
      
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error deleting sprint');
      console.error('Error deleting sprint:', error);
      setError(error);
      
      toast({
        title: "Error deleting sprint",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    fetchSprints,
    fetchCurrentSprint,
    saveSprint,
    deleteSprint
  };
};
