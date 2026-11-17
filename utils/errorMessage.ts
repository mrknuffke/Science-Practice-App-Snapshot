/**
 * The message of a caught error, or a fallback. A `catch` variable is `unknown`: it may be an
 * Error, a thrown string, or anything else, so read `.message` only when one is there.
 */
export const errorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message) {
    return error.message;
  }
  return fallback;
};
