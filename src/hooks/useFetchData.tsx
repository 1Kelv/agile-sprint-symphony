
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseCore } from './useSupabaseCore';

/**
 * Hook for fetching data from Supabase tables
 */
export function useFetchData<T = any>(
  tableName: string,
  idField: string = 'id'
) {
  const {
    isLoading,
    setIsLoading,
    error,
    setError,
    buildQuery,
    handleError,
  } = useSupabaseCore(tableName);
  
  const [data, setData] = useState<T[] | null>(null);

  // Define options type to include all possible parameters
  interface FetchOptions {
    orderBy?: {
      column: string;
      ascending: boolean;
    };
    filters?: Array<{
      column: string;
      operator: string;
      value: any;
    }>;
    limit?: number;
    relationships?: string[];
    textSearch?: boolean;
    select?: string;
  }

  // Fetch all records with optional filters
  const fetchAll = useCallback(
    async (options: FetchOptions = {}) => {
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
        setData(responseData as T[] || []);
        return responseData as T[] || [];
      } catch (err) {
        console.error(`Error in fetchAll for ${tableName}:`, err);
        handleError(err, 'fetching data');
        return [] as T[];
      } finally {
        setIsLoading(false);
      }
    },
    [tableName, setIsLoading, handleError, setError, buildQuery]
  );

  // Fetch a single record by ID
  const fetchById = useCallback(
    async (id: string | number, options: FetchOptions = {}) => {
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
        return responseData as T;
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
