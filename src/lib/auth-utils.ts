
/**
 * Utility function to clean up authentication state
 * This helps prevent "limbo" states where users cannot log out or switch accounts
 */
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Formats currency values for display
 */
export const formatCurrency = (value: number): string => {
  if (value >= 1e12) {
    return `$${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    return `$${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `$${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `$${(value / 1e3).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
};

/**
 * Formats crypto values based on their price range
 */
export const formatCryptoValue = (value: number): string => {
  if (value >= 1000) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  } else if (value >= 1) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  } else if (value >= 0.01) {
    return value.toLocaleString(undefined, { maximumFractionDigits: 6 });
  } else {
    return value.toLocaleString(undefined, { maximumFractionDigits: 8 });
  }
};
