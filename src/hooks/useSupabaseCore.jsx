
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Core hook for Supabase operations
 */
export function useSupabaseCore(tableName) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tableExistsCache, setTableExistsCache] = useState({});

  // Show success toast message
  const showSuccess = useCallback((message) => {
    toast({
      title: message,
    });
  }, []);

  // Handle error and set error state
  const handleError = useCallback((err, operation) => {
    console.error(`Error ${operation}:`, err);
    setError(err);
    
    toast({
      title: `Error ${operation}`,
      description: err.message,
      variant: "destructive",
    });
    
    return err;
  }, []);

  // Check if a table exists with improved caching
  const tableExists = useCallback(async (table) => {
    const targetTable = table || tableName;
    
    // Return cached result if available
    if (tableExistsCache[targetTable] !== undefined) {
      return tableExistsCache[targetTable];
    }
    
    try {
      console.log(`Checking if table ${targetTable} exists`);
      
      // Use a simpler query that's less likely to fail
      const { error } = await supabase
        .from(targetTable)
        .select('id')
        .limit(1);
        
      let exists = true;
      if (error) {
        console.warn(`Table ${targetTable} might not exist:`, error.message);
        exists = false;
      }
      
      // Cache the result
      setTableExistsCache(prev => ({
        ...prev,
        [targetTable]: exists
      }));
      
      return exists;
    } catch (err) {
      console.error(`Error checking if table ${targetTable} exists:`, err);
      
      // Cache the negative result
      setTableExistsCache(prev => ({
        ...prev,
        [targetTable]: false
      }));
      
      return false;
    }
  }, [tableName, tableExistsCache]);

  // Build a Supabase query with optional filters, sorting, etc.
  const buildQuery = useCallback((options = {}) => {
    console.log("Building query for table:", tableName, "with options:", options);
    let query = supabase.from(tableName);
    
    // Start with a select
    let selectQuery = query.select('*');
    
    // Add related tables if specified
    if (options?.relationships && options.relationships.length > 0) {
      const relatedTables = options.relationships.join(',');
      selectQuery = query.select(`*, ${relatedTables}(*)`);
    }
    
    // Apply ordering if specified
    if (options?.orderBy) {
      const { column, ascending = true } = options.orderBy;
      selectQuery = selectQuery.order(column, { ascending });
    }
    
    // Apply limit if specified
    if (options?.limit) {
      selectQuery = selectQuery.limit(options.limit);
    }

    // Apply filters if specified (key-value pairs)
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        // Handle array values for 'in' queries
        if (Array.isArray(value)) {
          selectQuery = selectQuery.in(key, value);
        } else if (options.textSearch && key === 'title') {
          // Special case for text search on title
          selectQuery = selectQuery.ilike(key, `%${value}%`);
        } else {
          selectQuery = selectQuery.eq(key, value);
        }
      });
    }
    
    console.log("Query built:", selectQuery);
    return selectQuery;
  }, [tableName]);

  // Clear cache for a specific table or all tables
  const clearTableExistsCache = useCallback((table) => {
    if (table) {
      setTableExistsCache(prev => {
        const newCache = { ...prev };
        delete newCache[table];
        return newCache;
      });
    } else {
      setTableExistsCache({});
    }
  }, []);

  return {
    isLoading,
    setIsLoading,
    error,
    setError,
    buildQuery,
    handleError,
    showSuccess,
    tableExists,
    clearTableExistsCache,
  };
}

export default useSupabaseCore;
