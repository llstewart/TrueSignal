/**
 * Error sanitization utilities
 * Prevents leaking internal details to clients while maintaining useful error messages
 */

// Map of internal error patterns to user-friendly messages
const ERROR_MAPPINGS: Array<{ pattern: RegExp; message: string }> = [
  // Network/timeout/DNS errors
  { pattern: /timeout|ETIMEDOUT|ECONNRESET|ECONNREFUSED/i, message: 'Service temporarily unavailable. Please try again.' },
  { pattern: /ENOTFOUND|getaddrinfo|DNS/i, message: 'Service temporarily unavailable. Please try again in a moment.' },
  { pattern: /fetch failed|network error|failed to fetch/i, message: 'Network error. Please check your connection and try again.' },

  // Rate limiting
  { pattern: /rate limit|too many requests|429/i, message: 'Too many requests. Please wait a moment and try again.' },

  // Authentication
  { pattern: /unauthorized|401|invalid.*token|expired.*token/i, message: 'Session expired. Please sign in again.' },
  { pattern: /forbidden|403/i, message: 'Access denied. Please check your subscription.' },

  // External API errors (Outscraper, etc.)
  { pattern: /outscraper|api\.app\.outscraper/i, message: 'Search service temporarily unavailable. Please try again.' },
  { pattern: /quota exceeded|billing|payment required/i, message: 'Service limit reached. Please try again later.' },

  // Stripe errors
  { pattern: /stripe|payment|card/i, message: 'Payment processing error. Please try again or contact support.' },

  // Database errors
  { pattern: /supabase|postgres|database|PGRST/i, message: 'Database error. Please try again.' },
  { pattern: /duplicate|unique.*constraint|already exists/i, message: 'This operation has already been completed.' },

  // Generic server errors
  { pattern: /internal server error|500/i, message: 'Server error. Please try again.' },
];

// Errors that are safe to pass through (user-friendly already)
const SAFE_ERROR_PATTERNS: RegExp[] = [
  /insufficient credits/i,
  /you need \d+ credits?/i,
  /niche and location are required/i,
  /at least one business is required/i,
  /authentication required/i,
  /sign in required/i,
  /upgrade to/i,
  /please .* to continue/i,
];

/**
 * Sanitize an error message before sending to client
 * - Maps known internal errors to user-friendly messages
 * - Passes through already safe messages
 * - Falls back to generic message for unknown errors
 */
export function sanitizeErrorMessage(error: unknown, fallback = 'An unexpected error occurred. Please try again.'): string {
  // Extract message from various error types
  let message: string;

  if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String((error as { message: unknown }).message);
  } else {
    return fallback;
  }

  // Check if message is already safe
  if (SAFE_ERROR_PATTERNS.some(pattern => pattern.test(message))) {
    return message;
  }

  // Check for known error patterns and map to user-friendly messages
  for (const { pattern, message: friendlyMessage } of ERROR_MAPPINGS) {
    if (pattern.test(message)) {
      return friendlyMessage;
    }
  }

  // Log the original error for debugging (server-side only)
  if (typeof window === 'undefined') {
    console.error('[Error Sanitization] Unknown error type:', message);
  }

  return fallback;
}

/**
 * Create a sanitized error response for API routes
 */
export function createErrorResponse(
  error: unknown,
  statusCode = 500,
  additionalData?: Record<string, unknown>
): { error: string; [key: string]: unknown } {
  const sanitizedMessage = sanitizeErrorMessage(error);

  return {
    error: sanitizedMessage,
    ...additionalData,
  };
}

/**
 * Type guard to check if an error indicates rate limiting
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    return /rate limit|too many|429/i.test(error.message);
  }
  if (typeof error === 'string') {
    return /rate limit|too many|429/i.test(error);
  }
  return false;
}

/**
 * Type guard to check if an error indicates authentication issues
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return /unauthorized|401|token|expired|sign in/i.test(error.message);
  }
  if (typeof error === 'string') {
    return /unauthorized|401|token|expired|sign in/i.test(error);
  }
  return false;
}
