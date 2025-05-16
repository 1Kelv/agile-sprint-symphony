
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseCore } from './useSupabaseCore';

/**
 * Hook for fetching data from Supabase tables
 */
export function useFetchData(
  tableName,
  idField = 'id'
) {
  const {
    isLoading,
    setIsLoading,
    error,
    setError,
    buildQuery,
    handleError,
  } = useSupabaseCore(tableName);
  
  const [data, setData] = useState(null);

  // Fetch all records with optional filters
  const fetchAll = useCallback(
    async (options = {}) => {
      try {
        setIsLoading(true);
        setError(null);
        console.log(`Fetching data from ${tableName} with options:`, options);
        
        // Build query with options
        let query = buildQuery(options);
        
        const { data: responseData, error: responseError } = await query;

        if (responseError) {
          console.error(`Error fetching data from ${tableName}:`, responseError);
          throw responseError;
        }

        console.log(`Successfully fetched ${responseData?.length || 0} items from ${tableName}:`, responseData);
        setData(responseData || []);
        return responseData || [];
      } catch (err) {
        console.error(`Error in fetchAll for ${tableName}:`, err);
        handleError(err, 'fetching data');
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [tableName, setIsLoading, handleError, setError, buildQuery]
  );

  // Fetch a single record by ID
  const fetchById = useCallback(
    async (id, options = {}) => {
      if (!id) {
        console.error("No ID provided to fetchById");
        return null;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        console.log(`Fetching item with id ${id} from ${tableName}`);
        
        // Use the buildQuery function to create the base query with options
        let baseQuery = buildQuery(options);
        
        // Then add the ID filter and single item selection
        const { data: responseData, error: responseError } = await baseQuery
          .eq(idField, id)
          .maybeSingle();

        if (responseError) {
          if (responseError.code === 'PGRST116') {
            // No rows returned
            console.log(`No item found with id ${id} in ${tableName}`);
            return null;
          }
          console.error(`Error fetching item with id ${id} from ${tableName}:`, responseError);
          throw responseError;
        }

        console.log(`Successfully fetched item with id ${id} from ${tableName}:`, responseData);
        return responseData;
      } catch (err) {
        console.error(`Error in fetchById for ${tableName}:`, err);
        handleError(err, `fetching data by ID`);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [tableName, idField, setIsLoading, handleError, setError, buildQuery]
  );

  return {
    fetchAll,
    fetchById,
    isLoading,
    error,
    data,
  };
}

export default useFetchData;
