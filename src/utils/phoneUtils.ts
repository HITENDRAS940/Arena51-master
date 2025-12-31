
/**
 * Utility functions for phone number handling with +91 prefix
 */

export const COUNTRY_CODE = '+91';

/**
 * Format phone number by adding +91 prefix if not present
 * @param phone - The phone number (with or without +91)
 * @returns Formatted phone number with +91 prefix
 */
export const formatPhoneNumber = (phone: string): string => {
  if (!phone) return '';
  
  // Remove all non-digit characters except +
  const cleanPhone = phone.replace(/[^\d+]/g, '');
  
  // If already has +91, return as is
  if (cleanPhone.startsWith('+91')) {
    return cleanPhone;
  }
  
  // If starts with 91, add +
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    return `+${cleanPhone}`;
  }
  
  // If 10 digit number, add +91
  if (cleanPhone.length === 10) {
    return `${COUNTRY_CODE}${cleanPhone}`;
  }
  
  // Return as is if format is unclear
  return cleanPhone;
};

/**
 * Extract 10-digit phone number from formatted number
 * @param formattedPhone - Phone number with +91 prefix
 * @returns 10-digit phone number without prefix
 */
export const extractPhoneNumber = (formattedPhone: string): string => {
  if (!formattedPhone) return '';
  
  const cleanPhone = formattedPhone.replace(/[^\d]/g, '');
  
  // If 12 digits starting with 91, return last 10
  if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
    return cleanPhone.substring(2);
  }
  
  // If 10 digits, return as is
  if (cleanPhone.length === 10) {
    return cleanPhone;
  }
  
  return cleanPhone;
};

/**
 * Validate Indian phone number format
 * @param phone - Phone number to validate
 * @returns boolean indicating if phone number is valid
 */
export const validatePhoneNumber = (phone: string): boolean => {
  if (!phone) return false;
  
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Should be 10 digits and start with 6-9
  return cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone);
};

/**
 * Format phone number for display (e.g., +91 98765 43210)
 * @param phone - Phone number with or without +91
 * @returns Formatted display string
 */
export const formatPhoneForDisplay = (phone: string): string => {
  const formatted = formatPhoneNumber(phone);
  if (formatted.length === 13) { // +91xxxxxxxxxx
    return `${formatted.substring(0, 3)} ${formatted.substring(3, 8)} ${formatted.substring(8)}`;
  }
  return formatted;
};

/**
 * Get phone number for API calls (with +91 prefix)
 * @param phone - Raw phone number input
 * @returns Formatted phone number for API
 */
export const getPhoneForAPI = (phone: string): string => {
  return formatPhoneNumber(phone);
};