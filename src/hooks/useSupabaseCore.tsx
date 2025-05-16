
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface FilterOption {
  column: string;
  operator: string;
  value: any;
}

interface QueryOptions {
  orderBy?: {
    column: string;
    ascending: boolean;
  };
  filters?: Array<FilterOption>;
  limit?: number;
  relationships?: string[];
  textSearch?: boolean;
  select?: string;
}

/**
 * Core hook for Supabase operations
 */
export function useSupabaseCore(tableName: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [tableExistsCache, setTableExistsCache] = useState<Record<string, boolean>>({});

  // Show success toast message
  const showSuccess = useCallback((message: string) => {
    toast({
      title: message,
    });
  }, []);

  // Handle error and set error state
  const handleError = useCallback((err: any, operation: string) => {
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
  const tableExists = useCallback(async (table?: string) => {
    const targetTable = table || tableName;
    
    // Return cached result if available
    if (tableExistsCache[targetTable] !== undefined) {
      return tableExistsCache[targetTable];
    }
    
    try {
      console.log(`Checking if table ${targetTable} exists`);
      
      // Use a simpler query that's less likely to fail
      // Using 'as any' to temporarily bypass TypeScript strict checking for table names
      // This allows dynamic table names to be used
      const { error } = await (supabase
        .from(targetTable as any)
        .select('id')
        .limit(1));
        
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
  const buildQuery = useCallback((options: QueryOptions = {}) => {
    console.log("Building query for table:", tableName, "with options:", options);
    
    // Using 'as any' to temporarily bypass TypeScript strict checking for table names
    // This allows dynamic table names to be used
    let query = supabase.from(tableName as any);
    
    // Start with a select
    let selectQuery = query.select(options.select || '*');
    
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

    // Apply filters if specified
    if (options?.filters && Array.isArray(options.filters)) {
      options.filters.forEach((filter) => {
        const { column, operator, value } = filter;
        
        switch (operator) {
          case 'eq':
            selectQuery = selectQuery.eq(column, value);
            break;
          case 'neq':
            selectQuery = selectQuery.neq(column, value);
            break;
          case 'gt':
            selectQuery = selectQuery.gt(column, value);
            break;
          case 'gte':
            selectQuery = selectQuery.gte(column, value);
            break;
          case 'lt':
            selectQuery = selectQuery.lt(column, value);
            break;
          case 'lte':
            selectQuery = selectQuery.lte(column, value);
            break;
          case 'like':
            selectQuery = selectQuery.like(column, `%${value}%`);
            break;
          case 'ilike':
            selectQuery = selectQuery.ilike(column, `%${value}%`);
            break;
          case 'in':
            selectQuery = selectQuery.in(column, Array.isArray(value) ? value : [value]);
            break;
          default:
            selectQuery = selectQuery.eq(column, value);
        }
      });
    }
    
    console.log("Query built:", selectQuery);
    return selectQuery;
  }, [tableName]);

  // Clear cache for a specific table or all tables
  const clearTableExistsCache = useCallback((table?: string) => {
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
