/**
 * Creates an error handler function scoped to a specific context
 * @param context The context in which errors may occur (e.g., "Authentication", "Data fetching")
 * @returns A function that standardizes error handling
 */
export const createErrorHandler = (
  context: string
) => (error: unknown): Error => {
  console.error(`${context} error:`, error);
  
  if (error instanceof Error) {
    return error;
  }
  
  return new Error(
    typeof error === 'string' 
      ? error 
      : `Unknown error in ${context}`
  );
};

/**
 * Extracts a user-friendly message from various error types
 * @param error The error object
 * @returns A user-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // For development, return the actual error message
    return error.message;
  }
  
  // In production, you might want to return generic messages
  return 'An unexpected error occurred. Please try again later.';
}; 