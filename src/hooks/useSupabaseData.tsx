
import { useFetchData } from './useFetchData';
import { useMutateData } from './useMutateData';

/**
 * Combined hook that provides all Supabase data operations
 * This maintains backward compatibility with the original useSupabaseData hook
 */
export function useSupabaseData(tableName: string, idField: string = 'id') {
  const { 
    fetchAll, 
    fetchById, 
    isLoading: isFetching, 
    error: fetchError, 
    data 
  } = useFetchData(tableName, idField);
  
  const { 
    create, 
    update, 
    remove, 
    isLoading: isMutating, 
    error: mutationError 
  } = useMutateData(tableName, idField);
  
  // Combine loading states and errors
  const isLoading = isFetching || isMutating;
  const error = fetchError || mutationError;

  return {
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    isLoading,
    error,
    data
  };
}

export default useSupabaseData;
