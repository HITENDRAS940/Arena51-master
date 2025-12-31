/**
 * Validation Utility Functions
 * Provides centralized validation functions for forms and data
 */

/**
 * Validate phone number (10 digits)
 */
export const validatePhoneNumber = (phone: string): { isValid: boolean; error?: string } => {
  const cleaned = phone.replace(/\D/g, '');

  if (!cleaned) {
    return { isValid: false, error: 'Phone number is required' };
  }

  if (cleaned.length !== 10) {
    return { isValid: false, error: 'Phone number must be 10 digits' };
  }

  if (!cleaned.startsWith('6') && !cleaned.startsWith('7') && !cleaned.startsWith('8') && !cleaned.startsWith('9')) {
    return { isValid: false, error: 'Invalid phone number' };
  }

  return { isValid: true };
};

/**
 * Validate OTP (6 digits)
 */
export const validateOTP = (otp: string): { isValid: boolean; error?: string } => {
  const cleaned = otp.replace(/\D/g, '');

  if (!cleaned) {
    return { isValid: false, error: 'OTP is required' };
  }

  if (cleaned.length !== 6) {
    return { isValid: false, error: 'OTP must be 6 digits' };
  }

  return { isValid: true };
};

/**
 * Validate name
 */
export const validateName = (name: string): { isValid: boolean; error?: string } => {
  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Name is required' };
  }

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters' };
  }

  if (trimmed.length > 50) {
    return { isValid: false, error: 'Name must be less than 50 characters' };
  }

  // Allow only letters, spaces, and some special characters
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
};

/**
 * Validate service name
 */
export const validateServiceName = (name: string): { isValid: boolean; error?: string } => {
  const trimmed = name.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Service name is required' };
  }

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Service name must be at least 3 characters' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Service name must be less than 100 characters' };
  }

  return { isValid: true };
};

/**
 * Validate turf location
 */
export const validateLocation = (location: string): { isValid: boolean; error?: string } => {
  const trimmed = location.trim();

  if (!trimmed) {
    return { isValid: false, error: 'Location is required' };
  }

  if (trimmed.length < 5) {
    return { isValid: false, error: 'Location must be at least 5 characters' };
  }

  if (trimmed.length > 200) {
    return { isValid: false, error: 'Location must be less than 200 characters' };
  }

  return { isValid: true };
};

/**
 * Validate price
 */
export const validatePrice = (price: string | number): { isValid: boolean; error?: string } => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numericPrice)) {
    return { isValid: false, error: 'Price must be a valid number' };
  }

  if (numericPrice <= 0) {
    return { isValid: false, error: 'Price must be greater than 0' };
  }

  if (numericPrice > 100000) {
    return { isValid: false, error: 'Price must be less than ₹1,00,000' };
  }

  return { isValid: true };
};

/**
 * Validate description
 */
export const validateDescription = (description: string): { isValid: boolean; error?: string } => {
  const trimmed = description.trim();

  // Description is optional, so empty is valid
  if (!trimmed) {
    return { isValid: true };
  }

  if (trimmed.length < 10) {
    return { isValid: false, error: 'Description must be at least 10 characters' };
  }

  if (trimmed.length > 1000) {
    return { isValid: false, error: 'Description must be less than 1000 characters' };
  }

  return { isValid: true };
};

/**
 * Validate amenities (comma-separated string)
 */
export const validateAmenities = (amenities: string): { isValid: boolean; error?: string } => {
  const trimmed = amenities.trim();

  // Amenities are optional
  if (!trimmed) {
    return { isValid: true };
  }

  const amenityList = trimmed.split(',').map(a => a.trim()).filter(a => a);

  if (amenityList.length > 20) {
    return { isValid: false, error: 'Maximum 20 amenities allowed' };
  }

  // Check each amenity length
  for (const amenity of amenityList) {
    if (amenity.length > 50) {
      return { isValid: false, error: 'Each amenity must be less than 50 characters' };
    }
  }

  return { isValid: true };
};

/**
 * Validate image URL
 */
export const validateImageURL = (url: string): { isValid: boolean; error?: string } => {
  if (!url) {
    return { isValid: false, error: 'Image URL is required' };
  }

  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validate time format (HH:MM:SS or HH:MM)
 */
export const validateTimeFormat = (time: string): { isValid: boolean; error?: string } => {
  if (!time) {
    return { isValid: false, error: 'Time is required' };
  }

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(:([0-5][0-9]))?$/;

  if (!timeRegex.test(time)) {
    return { isValid: false, error: 'Invalid time format. Use HH:MM or HH:MM:SS' };
  }

  return { isValid: true };
};

/**
 * Validate slot time range
 */
export const validateTimeRange = (
  startTime: string,
  endTime: string
): { isValid: boolean; error?: string } => {
  const startValidation = validateTimeFormat(startTime);
  if (!startValidation.isValid) {
    return { isValid: false, error: `Start time: ${startValidation.error}` };
  }

  const endValidation = validateTimeFormat(endTime);
  if (!endValidation.isValid) {
    return { isValid: false, error: `End time: ${endValidation.error}` };
  }

  // Convert to comparable format
  const start = startTime.split(':').map(Number);
  const end = endTime.split(':').map(Number);

  const startMinutes = start[0] * 60 + start[1];
  const endMinutes = end[0] * 60 + end[1];

  if (endMinutes <= startMinutes && endMinutes !== 0) {
    return { isValid: false, error: 'End time must be after start time' };
  }

  return { isValid: true };
};

/**
 * Validate email (optional, for future use)
 */
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
};

/**
 * Validate form object with multiple fields
 */
export interface ValidationRule {
  validator: (value: any) => { isValid: boolean; error?: string };
  required?: boolean;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export const validateForm = (
  data: Record<string, any>,
  rules: ValidationRules
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    // Check if field is required
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      continue;
    }

    // Skip validation if field is empty and not required
    if (!rule.required && (value === undefined || value === null || value === '')) {
      continue;
    }

    // Run validator
    const result = rule.validator(value);
    if (!result.isValid && result.error) {
      errors[field] = result.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
