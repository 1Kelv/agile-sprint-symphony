
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useFetchData = (tableName, idField = "id") => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const buildQuery = useCallback((options = {}) => {
    console.log(`Building query for ${tableName} with options:`, options);
    
    let query = supabase
      .from(tableName)
      .select(options.select || '*');
    
    if (options.relationships) {
      const relationshipSelect = Array.isArray(options.relationships)
        ? options.relationships.join(',')
        : options.relationships;
      query = query.select(`*, ${relationshipSelect}`);
    }
    
    // Apply ordering if specified
    if (options.orderBy) {
      const { column, ascending } = options.orderBy;
      query = query.order(column, { ascending });
    }
    
    // Apply filters if specified
    if (options.filters) {
      if (Array.isArray(options.filters)) {
        // Handle array of filter objects
        options.filters.forEach((filter) => {
          const { column, operator, value } = filter;
          
          switch (operator) {
            case 'eq':
              query = query.eq(column, value);
              break;
            case 'neq':
              query = query.neq(column, value);
              break;
            case 'gt':
              query = query.gt(column, value);
              break;
            case 'gte':
              query = query.gte(column, value);
              break;
            case 'lt':
              query = query.lt(column, value);
              break;
            case 'lte':
              query = query.lte(column, value);
              break;
            case 'like':
              query = query.like(column, `%${value}%`);
              break;
            case 'ilike':
              query = query.ilike(column, `%${value}%`);
              break;
            case 'in':
              query = query.in(column, Array.isArray(value) ? value : [value]);
              break;
            default:
              query = query.eq(column, value);
          }
        });
      } else {
        // Handle object with key/value pairs
        Object.entries(options.filters).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            // If value is an array, use 'in' operator
            query = query.in(key, value);
          } else {
            query = query.eq(key, value);
          }
        });
      }
    }
    
    return query;
  }, [tableName]);

  const fetchAll = useCallback(async (options = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching all from ${tableName} with options:`, options);
      
      const query = buildQuery(options);
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching from ${tableName}:`, error);
        setError(error);
        return [];
      }
      
      console.log(`Fetched ${data?.length || 0} rows from ${tableName}:`, data);
      setData(data || []);  // Make sure we set an empty array if data is null
      return data || [];    // Return empty array if data is null
    } catch (error) {
      console.error(`Error in fetchAll for ${tableName}:`, error);
      setError(error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [tableName, buildQuery]);

  const fetchById = useCallback(async (id, options = {}) => {
    if (!id) {
      console.error("No ID provided to fetchById");
      return null;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching ${tableName} with ID ${id}`);
      
      const query = buildQuery(options);
      const { data, error } = await query
        .eq(idField, id)
        .maybeSingle();
      
      if (error) {
        console.error(`Error fetching ${tableName} by ID:`, error);
        setError(error);
        return null;
      }
      
      setData(data);
      return data;
    } catch (error) {
      console.error(`Error in fetchById for ${tableName}:`, error);
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [tableName, idField, buildQuery]);

  return {
    fetchAll,
    fetchById,
    isLoading,
    error,
    data
  };
};

export default useFetchData;
