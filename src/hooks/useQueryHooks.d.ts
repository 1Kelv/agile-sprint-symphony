
// Type definitions for data fetch and mutation hooks

export interface FetchDataOptions {
  columns?: string;
  filter?: string;
  order?: string;
  [key: string]: any;
}

export interface FetchDataResult<T = any> {
  data?: T[];
  isLoading: boolean;
  isError?: boolean;
  error: any;
  refetch: () => void;
}

export interface MutationOptions {
  resource: string;
  id?: string | number;
  data?: any;
}

export interface MutationResult {
  mutate: (options: MutationOptions) => Promise<any>;
  isLoading: boolean;
  error: any;
}
