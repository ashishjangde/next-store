/**
 * Extracts an error message from an API error response
 * 
 * @param error - The error object from an API response
 * @param defaultMessage - Default message to show if error message can't be extracted
 * @returns A string containing the error message
 */
export const extractErrorMessage = (error: any, defaultMessage = "Something went wrong"): string => {
  // Check if we have an API error with errors object
  if (error?.response?.data?.apiError?.errors && 
      Object.keys(error.response.data.apiError.errors).length > 0) {
    // Get the first error message
    return Object.values(error.response.data.apiError.errors)[0] as string;
  }
  
  // Check if we have a direct API error message
  if (error?.response?.data?.apiError?.message) {
    return error.response.data.apiError.message;
  }
  
  // Check for a standard error message
  if (error?.message) {
    return error.message;
  }
  
  // If all else fails, return the default message
  return defaultMessage;
};
