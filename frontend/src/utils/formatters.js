/**
 * Format utilities for display text
 */

/**
 * Convert kebab-case to Title Case
 * @param {string} str - String in kebab-case format
 * @returns {string} String in Title Case format
 */
export const formatKebabToTitleCase = (str) => {
  if (!str) return '';
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format agent name from kebab-case or any format to readable name
 * @param {string} name - Agent name
 * @returns {string} Formatted agent name
 */
export const formatAgentName = (name) => {
  if (!name) return '';
  
  // If it's already in mixed case or Title Case, keep it
  if (name.includes(' ') || /[A-Z]/.test(name)) {
    return name;
  }
  
  // Otherwise convert from kebab-case
  return formatKebabToTitleCase(name);
};
