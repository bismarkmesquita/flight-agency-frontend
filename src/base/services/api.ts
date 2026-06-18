/* eslint-disable  @typescript-eslint/no-explicit-any */
'use client';

import { accessTokenStorageKey } from '@/auth/models/token';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';

export {
  usePublicAPI,
  usePrivateAPI,
  usePaginatedEndpoint,
  doTaskRequest,
  downloadFile,
};
export type {
  APIResponse,
  TaskStatus,
  CreateTaskResponse,
  PoolResponse,
  FileDownloadOptions,
};

type APIResponse<T> = T & {
  success?: boolean;
  reason?: string;
  message?: string;
};

// File download options interface
interface FileDownloadOptions {
  url: string;
  filename?: string;
  params?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

/**
 * Triggers a file download from the specified URL
 *
 * @param api - AxiosInstance to use for the request
 * @param options - Download options including URL, filename, and optional parameters
 * @returns Promise resolving to boolean indicating success
 */
async function downloadFile(
  api: AxiosInstance,
  options: FileDownloadOptions
): Promise<boolean> {
  try {
    const response = await api.get(options.url, {
      responseType: 'blob',
      params: options.params,
      headers: options.headers,
      transformResponse: (data) => data, // Prevent JSON parsing
    });

    if (!response.data) {
      return false;
    }

    // Create a blob URL for the file
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    // Get filename from Content-Disposition header if available
    let filename = options.filename;
    const contentDisposition = response.headers?.['content-disposition'];
    if (!filename && contentDisposition) {
      const match = /filename="([^"]*)"/.exec(contentDisposition);
      if (match) {
        filename = match[1];
      }
    }

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'download');
    document.body.appendChild(link);
    link.click();

    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
}

function usePublicAPI(): AxiosInstance {
  const router = useRouter();
  const API = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 5 * 60 * 1000,
      transformResponse,
    });
    instance.interceptors.request.use((config) => {
      return config;
    });
    instance.interceptors.response.use(
      (response) => response,
      (error) => onRequestError(error, router)
    );
    return getModifiedAPI(instance);
  }, [router]);

  return API;
}

function usePrivateAPI(): AxiosInstance {
  const router = useRouter();
  const API = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 5 * 60 * 1000,
      transformResponse,
      responseType: 'json',
    });
    instance.interceptors.request.use((config) => {
      const encodedToken = localStorage.getItem(accessTokenStorageKey);
      if (encodedToken) {
        const token = JSON.parse(encodedToken).token;
        config.headers.Authorization = `Token ${token}`;
      }
      return config;
    });
    instance.interceptors.response.use(
      (response) => response,
      (error) => onRequestError(error, router)
    );
    return getModifiedAPI(instance);
  }, [router]);

  return API;
}

interface PaginationInfo<P> {
  num_pages: number;
  num_items: number;
  items: P[];
  page: number;
}

type PaginatedResponse<P> = APIResponse<PaginationInfo<P>>;

type PaginatedEndpointProps = {
  url: string;
  pageSize: number;
  pathParams?: string[];
};

function usePaginatedEndpoint<P, Q extends Record<string, unknown>>({
  url,
  pageSize,
  pathParams = [],
}: PaginatedEndpointProps) {
  const API = usePrivateAPI();
  const [page, setPage] = useState(1);
  const [_fetchedItems, _setFetchedItems] = useState<(P | undefined)[]>([]);
  const [items, setItems] = useState<P[]>([]);
  const [processing, _setProcessing] = useState(true);
  const activeRequestsRef = useRef(0);
  const [_filters, _setFilters] = useState<Q | undefined>();
  const [numPages, _setNumPages] = useState(0);
  const [error, _setError] = useState<string | undefined>();
  const [_forceFetch, _setForceFetch] = useState(false);

  const reset = useCallback(() => {
    setPage(1);
    _setFetchedItems([]);
    setItems([]);
    _setNumPages(0);
    _setError(undefined);
    _setForceFetch(true);
  }, []);

  const getUrl = useCallback(
    (f: Q | undefined) => {
      const query = new URLSearchParams();
      query.set('page', page.toString());
      Object.entries(f ?? {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          query.set(key, String(value));
        }
      });
      let u = `${url}`;
      pathParams.forEach((param) => {
        u += `${param}/`;
      });

      return `${u}?${query.toString()}`;
    },
    [url, page, pageSize, pathParams]
  );

  const onFiltersChange = useCallback(
    (filters: Q) => {
      if (getUrl(_filters) === getUrl(filters)) {
        return;
      }
      _setFetchedItems(Array(pageSize).fill(undefined));
      _setFilters(filters);
      setPage(1);
    },
    [pageSize, getUrl]
  );

  useEffect(() => {
    const needsFetch = () => {
      if (_forceFetch) {
        _setForceFetch(false);
        return true;
      }
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const isInRange =
        start < _fetchedItems.length &&
        end <= _fetchedItems.length &&
        start >= 0;
      const isAllFetchedWithinRange = _fetchedItems
        .slice(start, end)
        .every((item) => item !== undefined);
      return !isInRange || !isAllFetchedWithinRange;
    };

    const fetchItems = async () => {
      activeRequestsRef.current += 1;
      _setProcessing(true);

      try {
        const response = await API.get<PaginatedResponse<P>>(getUrl(_filters));
        const data = response.data;
        if (!data.success) {
          _setError(data.reason);
        } else {
          _setNumPages(data.num_pages);
          const start = (page - 1) * pageSize;

          // preserve existing items while extending array to full size if needed
          const fetchedItems = [..._fetchedItems];
          if (fetchedItems.length < data.num_pages * pageSize) {
            fetchedItems.length = data.num_pages * pageSize;
            fetchedItems.fill(undefined, _fetchedItems.length);
          }
          fetchedItems.splice(start, pageSize, ...data.items);
          _setFetchedItems(fetchedItems);
          setItems(data.items);
        }
      } catch (error) {
        console.error('Error fetching paginated data:', error);
        _setError('Failed to fetch data');
      } finally {
        activeRequestsRef.current -= 1;
        if (activeRequestsRef.current === 0) {
          _setProcessing(false);
        }
      }
    };

    if (needsFetch()) {
      fetchItems();
    } else {
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      setItems(
        _fetchedItems.slice(start, end).filter((item) => item !== undefined)
      );
    }
  }, [page, _filters, _forceFetch]);

  useEffect(() => {
    reset();
  }, [JSON.stringify(pathParams)]);

  return {
    items,
    page,
    setPage,
    processing,
    onFiltersChange,
    error,
    numPages,
    reset,
  };
}

interface UseFrontendPaginationProps<T> {
  url: string;
  pageSize: number;
}

export function useFrontendPagination<T>({ url, pageSize }: UseFrontendPaginationProps<T>) {
  const API = usePrivateAPI();
  const [allItems, setAllItems] = useState<T[]>([]);
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await API.get(url);
      setAllItems(res.data.items ?? []);
    } catch (err) {
      console.error(err);
      setError("Error loading data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    setItems(allItems.slice(start, end));
  }

  const refresh = () => {
    fetchAll();
  }

  const addItem = (item: T) => {
    setAllItems(prev => [item, ...prev]);
  };

  useEffect(() => {
    fetchAll();
  }, [url]);

  useEffect(() => {
    fetchItems();
  }, [allItems, page, pageSize]);

  const numPages = useMemo(
    () => Math.ceil(allItems.length / pageSize),
    [allItems, pageSize]
  );

  return {
    items,
    page,
    setPage,
    numPages,
    loading,
    error,
    allItems,
    setAllItems,
    refresh,
    addItem,
  };
}

function getModifiedAPI(axiosInstance: AxiosInstance) {
  const instance = Object.assign({}, axiosInstance);
  instance.request = async <T = any, R = AxiosResponse<T>>(
    config: AxiosRequestConfig<T>
  ): Promise<R> => {
    try {
      return await axiosInstance.request(config);
    } catch (error: any) {
      return error;
    }
  };
  instance.get = async <T = any, R = AxiosResponse<T>>(
    ...args: Parameters<typeof axiosInstance.get>
  ): Promise<R> => {
    try {
      return await axiosInstance.get(...args);
    } catch (error: any) {
      return error;
    }
  };
  instance.post = async <T = any, R = AxiosResponse<T>>(
    ...args: Parameters<typeof axiosInstance.post>
  ): Promise<R> => {
    try {
      return await axiosInstance.post(...args);
    } catch (error: any) {
      return error;
    }
  };
  instance.put = async <T = any, R = AxiosResponse<T>>(
    ...args: Parameters<typeof axiosInstance.put>
  ): Promise<R> => {
    try {
      return await axiosInstance.put(...args);
    } catch (error: any) {
      return error;
    }
  };
  instance.delete = async <T = any, R = AxiosResponse<T>>(
    ...args: Parameters<typeof axiosInstance.delete>
  ): Promise<R> => {
    try {
      return await axiosInstance.delete(...args);
    } catch (error: any) {
      return error;
    }
  };

  return instance;
}

function transformResponse(data: any): any {
  data = JSON.parse(data);
  if (data.success === undefined) {
    data.success = false;
  }

  if (!data.success && data.reason === undefined) {
    data.reason = 'unknown';
  }

  return data;
}

function onRequestError(
  error: AxiosError,
  router: AppRouterInstance
): Promise<AxiosResponse> {
  if (error.status === 401 || error.status === 403) {
    localStorage.removeItem('ACCESS_TOKEN');
    router.push('/login');
  }

  // TODO: 404
  if (error.response && error.response.status === 404) {
    router.push('/');
  }
  // TODO: 503

  if (error.response && error.response.status === 500) {
    return new Promise(() => ({
      success: false,
      reason: 'unknown',
      message:
        'An unexpected error occurred.\nError log: ' + error.response?.data,
    }));
  }

  return Promise.reject(error);
}

enum TaskStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}

type CreateTaskResponse = APIResponse<{
  task_id?: string;
}>;

type PoolResponse = APIResponse<{
  status?: TaskStatus;
}>;

type TaskRequestParams<T extends APIResponse<any>, M extends PoolResponse> = {
  createTaskFunction: () => Promise<CreateTaskResponse>;
  poolFunction: (taskId: string) => Promise<M>;
  resultFunction: (taskId: string) => Promise<T>;
  interval?: number;
  timeout?: number;
};

/**
 * Executes a task request with polling for completion.
 *
 * @param createTaskFunction - Function to create the initial task, returns task ID
 * @param poolFunction - Function to check task status by polling the task ID
 * @param resultFunction - Function to get final task result once complete (including downloading files if needed)
 * @param interval - Polling interval in milliseconds (default: 3000ms)
 * @param timeout - Maximum time to wait for task completion in milliseconds (default: 100000ms)
 * @returns Promise resolving to task result of type T
 *
 * The function will:
 * 1. Create a task using createTaskFunction
 * 2. Poll the task status using poolFunction at the specified interval
 * 3. Return the result using resultFunction when status is SUCCESS
 * 4. Return error if task fails or times out
 */
async function doTaskRequest<
  T extends APIResponse<any>,
  M extends PoolResponse = PoolResponse,
>({
  createTaskFunction,
  poolFunction,
  resultFunction,
  interval = 3000,
  timeout = 100000,
}: TaskRequestParams<T, M>): Promise<T> {
  const taskResult = await createTaskFunction();
  if (!taskResult.success) {
    return {
      success: false,
      message: taskResult.message ?? 'Error creating task.',
    } as T;
  }

  const taskId = taskResult.task_id!;
  const startTime = Date.now();
  while (true) {
    const poolResult = await poolFunction(taskId);
    if (!poolResult.success) {
      return {
        success: false,
        message: poolResult.message ?? 'Error retrieving task status.',
      } as T;
    }

    if (poolResult.status === TaskStatus.SUCCESS) {
      return await resultFunction(taskId);
    }

    if (poolResult.status === TaskStatus.FAILURE) {
      return {
        success: false,
        message: poolResult.message ?? 'Task failed',
      } as T;
    }

    if (Date.now() - startTime > timeout) {
      return {
        success: false,
        message: 'Timeout while waiting for task.',
      } as T;
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}
