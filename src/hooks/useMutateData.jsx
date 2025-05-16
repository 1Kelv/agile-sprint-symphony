
import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseCore } from './useSupabaseCore';

/**
 * Enhanced hook for mutating data in Supabase tables
 * Supports both direct calls and React Query pattern
 */
export function useMutateData(tableName, idField = 'id') {
  const {
    isLoading: coreIsLoading,
    setIsLoading: setCoreIsLoading,
    error: coreError,
    handleError,
    showSuccess,
  } = useSupabaseCore(tableName);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create a new record
  const create = useCallback(
    async (data) => {
      try {
        setIsLoading(true);
        setCoreIsLoading(true);
        console.log(`Creating ${tableName} with data:`, data);

        const { data: createdData, error } = await supabase
          .from(tableName)
          .insert([data])
          .select();

        if (error) {
          console.error(`Error creating ${tableName}:`, error);
          throw error;
        }

        console.log(`Successfully created ${tableName}:`, createdData);
        showSuccess(`Successfully created ${tableName}`);
        return (createdData && createdData[0] ? createdData[0] : null);
      } catch (err) {
        console.error(`Error in create function for ${tableName}:`, err);
        setError(err);
        handleError(err, 'creating data');
        return null;
      } finally {
        setIsLoading(false);
        setCoreIsLoading(false);
      }
    },
    [tableName, setCoreIsLoading, handleError, showSuccess]
  );

  // Update an existing record
  const update = useCallback(
    async (id, data) => {
      try {
        setIsLoading(true);
        setCoreIsLoading(true);
        console.log(`Updating ${tableName} with ID ${id} with data:`, data);

        const { data: updatedData, error } = await supabase
          .from(tableName)
          .update(data)
          .eq(idField, id)
          .select();

        if (error) {
          console.error(`Error updating ${tableName}:`, error);
          throw error;
        }

        console.log(`Successfully updated ${tableName}:`, updatedData);
        showSuccess(`Successfully updated ${tableName}`);
        return (updatedData && updatedData[0] ? updatedData[0] : null);
      } catch (err) {
        console.error(`Error in update function for ${tableName}:`, err);
        setError(err);
        handleError(err, 'updating data');
        return null;
      } finally {
        setIsLoading(false);
        setCoreIsLoading(false);
      }
    },
    [tableName, idField, setCoreIsLoading, handleError, showSuccess]
  );

  // Delete a record
  const remove = useCallback(
    async (id) => {
      try {
        setIsLoading(true);
        setCoreIsLoading(true);
        console.log(`Deleting ${tableName} with ID ${id}`);

        const { error } = await supabase
          .from(tableName)
          .delete()
          .eq(idField, id);

        if (error) {
          console.error(`Error deleting ${tableName}:`, error);
          throw error;
        }

        console.log(`Successfully deleted ${tableName} with ID ${id}`);
        showSuccess(`Successfully deleted ${tableName}`);
        return true;
      } catch (err) {
        console.error(`Error in remove function for ${tableName}:`, err);
        setError(err);
        handleError(err, 'deleting data');
        return false;
      } finally {
        setIsLoading(false);
        setCoreIsLoading(false);
      }
    },
    [tableName, idField, setCoreIsLoading, handleError, showSuccess]
  );

  // Unified mutation function for React Query pattern
  const mutate = useCallback(
    async ({ resource, id, data, type }) => {
      if (!resource && !tableName) {
        throw new Error('Resource or tableName is required for mutation');
      }

      // Override tableName if resource is provided
      const targetTable = resource || tableName;

      try {
        setIsLoading(true);
        setCoreIsLoading(true);
        console.log(`Mutating ${targetTable} with type ${type}, id ${id}, data:`, data);

        // Explicitly handle based on type for more control
        if (type === 'create' || (!type && !id && data)) {
          const { data: createdData, error } = await supabase
            .from(targetTable)
            .insert([data])
            .select();

          if (error) throw error;
          console.log(`Created ${targetTable}:`, createdData);
          showSuccess(`Successfully created ${targetTable}`);
          return createdData?.[0] || null;
        }
        
        if (type === 'update' || (!type && id && data)) {
          const { data: updatedData, error } = await supabase
            .from(targetTable)
            .update(data)
            .eq('id', id)
            .select();

          if (error) throw error;
          console.log(`Updated ${targetTable}:`, updatedData);
          showSuccess(`Successfully updated ${targetTable}`);
          return updatedData?.[0] || null;
        }
        
        if (type === 'delete' || (!type && id && !data)) {
          const { error } = await supabase
            .from(targetTable)
            .delete()
            .eq('id', id);

          if (error) throw error;
          console.log(`Deleted ${targetTable} with ID ${id}`);
          showSuccess(`Successfully deleted ${targetTable}`);
          return true;
        }
        
        throw new Error('Invalid mutation parameters');
      } catch (err) {
        console.error(`Error in mutate function for ${targetTable}:`, err);
        setError(err);
        handleError(err, 'mutation operation');
        throw err;
      } finally {
        setIsLoading(false);
        setCoreIsLoading(false);
      }
    },
    [tableName, handleError, showSuccess, setCoreIsLoading]
  );

  return {
    // Legacy pattern
    create,
    update,
    remove,
    isLoading: coreIsLoading || isLoading,
    error: coreError || error,
    
    // React Query pattern
    mutate
  };
}

export default useMutateData;
