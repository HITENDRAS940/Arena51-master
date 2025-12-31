export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_PHONE: 'Please enter a valid 10-digit phone number',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_OTP: 'Please enter a valid 6-digit OTP',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  PASSWORDS_NOT_MATCH: 'Passwords do not match',
  INVALID_PRICE: 'Please enter a valid price',
  INVALID_TIME: 'Please select a valid time',
  INVALID_DATE: 'Please select a valid date',
  MIN_SLOTS: 'Please select at least one time slot',
  BOOKING_PAST_DATE: 'Cannot book for past dates',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
};

export const SUCCESS_MESSAGES = {
  OTP_SENT: 'OTP sent successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  BOOKING_CREATED: 'Booking created successfully',
  BOOKING_CANCELLED: 'Booking cancelled successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  SERVICE_CREATED: 'Service created successfully',
  SERVICE_UPDATED: 'Service updated successfully',
  SERVICE_DELETED: 'Service deleted successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  UNAUTHORIZED: 'Session expired. Please login again',
  FORBIDDEN: 'You do not have permission to perform this action',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Please check your input and try again',
  OTP_EXPIRED: 'OTP has expired. Please request a new one',
  INVALID_CREDENTIALS: 'Invalid credentials',
  BOOKING_FAILED: 'Failed to create booking',
  FETCH_FAILED: 'Failed to fetch data',
  UNKNOWN_ERROR: 'Something went wrong. Please try again',
};

export const BOOKING_STATUS = {
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  PENDING: 'PENDING',
};

export const USER_ROLES = {
  USER: 'ROLE_USER',
  ADMIN: 'ROLE_ADMIN',
};

export const TIME_SLOTS = {
  MORNING: ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00'],
  AFTERNOON: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
  EVENING: ['18:00', '19:00', '20:00', '21:00', '22:00'],
};

export const SERVICE_TYPES = [
  'Football',
  'Cricket',
  'Badminton',
  'Tennis',
  'Basketball',
  'Volleyball',
  'Multi-sport',
];

export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Wallet',
];

export const APP_CONFIG = {
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 5,
  MIN_BOOKING_HOURS: 2,
  MAX_BOOKING_DAYS: 30,
  CANCELLATION_HOURS: 2,
  REFRESH_INTERVAL: 30000, // 30 seconds
  API_TIMEOUT: 10000, // 10 seconds
};

export const SCREEN_NAMES = {
  // Auth
  PHONE_ENTRY: 'PhoneEntry',
  OTP_VERIFICATION: 'OTPVerification',

  // User
  SERVICE_LIST: 'ServiceList',
  SERVICE_DETAIL: 'ServiceDetail',
  MY_BOOKINGS: 'MyBookings',
  PROFILE: 'Profile',

  // Admin
  DASHBOARD: 'Dashboard',
  SERVICE_MANAGEMENT: 'ServiceManagement',
  ALL_BOOKINGS: 'AllBookings',

  // Common
  SETTINGS: 'Settings',
  HELP: 'Help',
  ABOUT: 'About',
};

export const REGEX_PATTERNS = {
  PHONE: /^[6-9]\d{9}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  OTP: /^\d{6}$/,
  PRICE: /^\d+(\.\d{1,2})?$/,
  TIME: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
};

export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  API: 'yyyy-MM-dd',
  TIME: 'HH:mm',
  DATETIME: 'dd MMM yyyy, HH:mm',
  DAY: 'EEEE',
  MONTH_YEAR: 'MMM yyyy',
};

export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
  SETTINGS: 'settings',
  LAST_LOGIN: 'lastLogin',
  ONBOARDING_COMPLETED: 'onboardingCompleted',
};

export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
