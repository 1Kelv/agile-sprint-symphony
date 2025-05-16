
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Sprint {
  id: number;
  name: string;
  description?: string;
  goal?: string;
  start_date: string;
  end_date: string;
  status: string;
  progress: number;
  tasks_completed: number;
  tasks_total: number;
  story_points?: number;
  project_id?: string;
  created_at: string;
}

export function useSprintMutations(
  loadSprints: (showLoading?: boolean) => Promise<Sprint[]>,
  setSprints: React.Dispatch<React.SetStateAction<Sprint[]>>
) {
  const handleSaveSprint = async (
    sprintData: Partial<Sprint> & { name: string; start_date: string; end_date: string; status: string },
    isEditing: boolean,
    selectedSprint: Sprint | null
  ) => {
    try {
      if (isEditing && selectedSprint) {
        const { error } = await supabase
          .from('sprints')
          .update(sprintData)
          .eq('id', selectedSprint.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('sprints')
          .insert(sprintData);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error saving sprint:', error);
      toast({
        title: "Error saving sprint",
        description: "There was an error saving the sprint. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const confirmDeleteSprint = async (sprintId: number | null) => {
    if (!sprintId) return false;

    try {
      const { error } = await supabase
        .from('sprints')
        .delete()
        .eq('id', sprintId);

      if (error) throw error;

      setSprints((prevSprints: Sprint[]) => 
        prevSprints.filter(sprint => sprint.id !== sprintId)
      );

      toast({
        title: "Sprint deleted",
        description: "The sprint has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting sprint:', error);
      toast({
        title: "Error deleting sprint",
        description: "There was an error deleting the sprint. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    handleSaveSprint,
    confirmDeleteSprint,
  };
}

export default useSprintMutations;
