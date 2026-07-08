export interface ApiResponseFormat<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors: any;
  timestamp: string;
}

/**
 * Standard API Response Generator
 * @param success Whether the operation was successful
 * @param message User-friendly status message
 * @param data Response data payload
 * @param errors Error details, if any
 */
export const createApiResponse = <T = any>(
  success: boolean,
  message: string,
  data: T = {} as T,
  errors: any = null
): ApiResponseFormat<T> => {
  return {
    success,
    message,
    data,
    errors,
    timestamp: new Date().toISOString(),
  };
};
