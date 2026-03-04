/**
 * Generic HTTP client wrapper with interceptors, retry logic, and error handling
 * @module services/api-client
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  CancelTokenSource,
  InternalAxiosRequestConfig,
} from 'axios';

import type { ApiResponseWrapper as ApiResponse, ApiErrorDetails as ApiError } from '../types/mission';

/**
 * Configuration options for the API client
 */
interface ApiClientConfig {
  /** Base URL for all requests */
  baseURL?: string;
  /** Default timeout in milliseconds */
  timeout?: number;
  /** Number of retry attempts for failed requests */
  retries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
  /** Request headers */
  headers?: Record<string, string>;
}

/**
 * Request interceptor function type
 */
type RequestInterceptor = (
  config: AxiosRequestConfig
) => AxiosRequestConfig | Promise<AxiosRequestConfig>;

/**
 * Response interceptor function type
 */
type ResponseInterceptor<T = unknown> = (
  response: AxiosResponse<T>
) => AxiosResponse<T> | Promise<AxiosResponse<T>>;

/**
 * Error interceptor function type
 */
type ErrorInterceptor = (error: AxiosError) => Promise<AxiosError>;

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<ApiClientConfig> = {
  baseURL: '',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

/**
 * HTTP status codes that should trigger a retry
 */
const RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Generic API client with request/response interceptors,
 * automatic retry logic, and timeout handling
 */
export class ApiClient {
  private client: AxiosInstance;
  private config: Required<ApiClientConfig>;
  private cancelTokenSource: CancelTokenSource | null = null;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  /**
   * Creates a new API client instance
   * @param config - Client configuration options
   */
  constructor(config: ApiClientConfig = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: this.config.headers,
    });

    this.setupInterceptors();
  }

  /**
   * Sets up Axios interceptors
   * @private
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Apply custom request interceptors
        let currentConfig: AxiosRequestConfig = config;
        for (const interceptor of this.requestInterceptors) {
          currentConfig = await interceptor(currentConfig);
        }
        return currentConfig as InternalAxiosRequestConfig;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      async (response) => {
        // Apply custom response interceptors
        for (const interceptor of this.responseInterceptors) {
          response = await interceptor(response);
        }
        return response;
      },
      async (error: AxiosError) => {
        // Apply custom error interceptors
        for (const interceptor of this.errorInterceptors) {
          await interceptor(error);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Adds a request interceptor
   * @param interceptor - Request interceptor function
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * Adds a response interceptor
   * @param interceptor - Response interceptor function
   */
  addResponseInterceptor<T>(interceptor: ResponseInterceptor<T>): void {
    this.responseInterceptors.push(
      interceptor as ResponseInterceptor<unknown>
    );
  }

  /**
   * Adds an error interceptor
   * @param interceptor - Error interceptor function
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor);
  }

  /**
   * Creates a new cancel token source for request cancellation
   * @returns Cancel token source
   */
  createCancelToken(): CancelTokenSource {
    // eslint-disable-next-line import/no-named-as-default-member
    this.cancelTokenSource = axios.CancelToken.source();
    return this.cancelTokenSource;
  }

  /**
   * Cancels any pending request
   * @param message - Optional cancellation message
   */
  cancel(message?: string): void {
    if (this.cancelTokenSource) {
      this.cancelTokenSource.cancel(message || 'Request cancelled by user');
      this.cancelTokenSource = null;
    }
  }

  /**
   * Checks if error is a cancellation
   * @param error - Error to check
   * @returns True if error is a cancellation
   */
  isCancel(error: unknown): boolean {
    return axios.isCancel(error);
  }

  /**
   * Normalizes an error into the standard ApiError format
   * @param error - Error to normalize
   * @returns Normalized API error
   * @private
   */
  private normalizeError(error: AxiosError | Error): ApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
        details?: Record<string, unknown>;
      }>;
      return {
        message:
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          axiosError.message ||
          'An unexpected error occurred',
        code: axiosError.code,
        status: axiosError.response?.status,
        details: axiosError.response?.data?.details,
      };
    }

    return {
      message: error.message || 'An unexpected error occurred',
    };
  }

  /**
   * Executes a request with retry logic
   * @param config - Axios request configuration
   * @param attempt - Current retry attempt
   * @returns Promise resolving to API response
   * @private
   */
  private async executeWithRetry<T>(
    config: AxiosRequestConfig,
    attempt: number = 0
  ): Promise<ApiResponse<T>> {
    try {
      // Add cancel token if not already present
      if (!config.cancelToken && this.cancelTokenSource) {
        config.cancelToken = this.cancelTokenSource.token;
      }

      const response = await this.client.request<T>(config);

      return {
        success: true,
        data: response.data,
        meta: {
          total: response.headers['x-total-count']
            ? parseInt(response.headers['x-total-count'], 10)
            : undefined,
        },
      };
    } catch (error) {
      // Don't retry on cancellation
      if (axios.isCancel(error)) {
        return {
          success: false,
          error: { message: 'Request was cancelled' },
        };
      }

      const axiosError = error as AxiosError;

      // Determine if we should retry
      const shouldRetry =
        attempt < this.config.retries &&
        (!axiosError.response ||
          RETRY_STATUS_CODES.includes(axiosError.response.status));

      if (shouldRetry) {
        // Calculate exponential backoff delay
        const delay = this.config.retryDelay * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.executeWithRetry<T>(config, attempt + 1);
      }

      return {
        success: false,
        error: this.normalizeError(axiosError),
      };
    }
  }

  /**
   * Makes a GET request
   * @param url - Request URL
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  async get<T>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.executeWithRetry<T>({ ...config, method: 'GET', url });
  }

  /**
   * Makes a POST request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  async post<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.executeWithRetry<T>({
      ...config,
      method: 'POST',
      url,
      data,
    });
  }

  /**
   * Makes a PUT request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  async put<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.executeWithRetry<T>({
      ...config,
      method: 'PUT',
      url,
      data,
    });
  }

  /**
   * Makes a PATCH request
   * @param url - Request URL
   * @param data - Request body data
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  async patch<T>(
    url: string,
    data?: unknown,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.executeWithRetry<T>({
      ...config,
      method: 'PATCH',
      url,
      data,
    });
  }

  /**
   * Makes a DELETE request
   * @param url - Request URL
   * @param config - Optional request configuration
   * @returns Promise resolving to API response
   */
  async delete<T>(
    url: string,
    config: AxiosRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.executeWithRetry<T>({ ...config, method: 'DELETE', url });
  }
}

/**
 * Default API client instance
 */
export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10),
  retries: parseInt(import.meta.env.VITE_API_RETRIES || '3', 10),
});

/**
 * Factory function to create a new API client with custom config
 * @param config - Client configuration
 * @returns New API client instance
 */
export function createApiClient(config: ApiClientConfig = {}): ApiClient {
  return new ApiClient(config);
}
