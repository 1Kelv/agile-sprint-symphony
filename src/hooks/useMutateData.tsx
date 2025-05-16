
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseCore } from './useSupabaseCore';

/**
 * Hook for mutating data in Supabase tables (create, update, delete)
 */
export function useMutateData(tableName, idField = 'id') {
  const {
    isLoading,
    setIsLoading,
    error,
    handleError,
    showSuccess,
  } = useSupabaseCore(tableName);

  // Create a new record
  const create = useCallback(
    async (data) => {
      try {
        setIsLoading(true);

        const { data: createdData, error } = await supabase
          .from(tableName)
          .insert([data])
          .select();

        if (error) {
          throw error;
        }

        showSuccess(`Successfully created ${tableName}`);
        return (createdData && createdData[0] ? createdData[0] : null);
      } catch (err) {
        handleError(err, 'creating data');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [tableName, setIsLoading, handleError, showSuccess]
  );

  // Update an existing record
  const update = useCallback(
    async (id, data) => {
      try {
        setIsLoading(true);

        const { data: updatedData, error } = await supabase
          .from(tableName)
          .update(data)
          .eq(idField, id)
          .select();

        if (error) {
          throw error;
        }

        showSuccess(`Successfully updated ${tableName}`);
        return (updatedData && updatedData[0] ? updatedData[0] : null);
      } catch (err) {
        handleError(err, 'updating data');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [tableName, idField, setIsLoading, handleError, showSuccess]
  );

  // Delete a record
  const remove = useCallback(
    async (id) => {
      try {
        setIsLoading(true);

        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq(idField, id);

        if (error) {
          throw error;
        }

        showSuccess(`Successfully deleted ${tableName}`);
        return true;
      } catch (err) {
        handleError(err, 'deleting data');
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [tableName, idField, setIsLoading, handleError, showSuccess]
  );

  return {
    create,
    update,
    remove,
    isLoading,
    error,
  };
}
