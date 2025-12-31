/**
 * Date Utility Functions
 * Provides centralized date formatting and parsing utilities
 */

import { format, parse, isToday, isSameDay, addDays, subDays } from 'date-fns';

/**
 * Format a date to 'yyyy-MM-dd' format
 */
export const formatDateToYYYYMMDD = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

/**
 * Format a date to 'dd MMM yyyy' format (e.g., "25 Dec 2023")
 */
export const formatDateToDDMMMYYYY = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMM yyyy');
};

/**
 * Format a date to 'dd MMM yyyy, HH:mm' format (e.g., "25 Dec 2023, 14:30")
 */
export const formatDateTimeToFull = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd MMM yyyy, HH:mm');
};

/**
 * Format a date to 'EEEE, dd MMM' format (e.g., "Monday, 25 Dec")
 */
export const formatDateToWeekday = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'EEEE, dd MMM');
};

/**
 * Format a date to 'MMM dd' format (e.g., "Dec 25")
 */
export const formatDateToShort = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd');
};

/**
 * Check if a date is today
 */
export const isDateToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return isToday(dateObj);
};

/**
 * Check if two dates are the same day
 */
export const areSameDay = (date1: Date | string, date2: Date | string): boolean => {
  const date1Obj = typeof date1 === 'string' ? new Date(date1) : date1;
  const date2Obj = typeof date2 === 'string' ? new Date(date2) : date2;
  return isSameDay(date1Obj, date2Obj);
};

/**
 * Add days to a date
 */
export const addDaysToDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return addDays(dateObj, days);
};

/**
 * Subtract days from a date
 */
export const subtractDaysFromDate = (date: Date | string, days: number): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return subDays(dateObj, days);
};

/**
 * Parse a date string in 'yyyy-MM-dd' format
 */
export const parseDateFromYYYYMMDD = (dateString: string): Date => {
  return parse(dateString, 'yyyy-MM-dd', new Date());
};

/**
 * Get today's date at midnight (00:00:00)
 */
export const getTodayAtMidnight = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/**
 * Get the start of a date (midnight)
 */
export const getStartOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setHours(0, 0, 0, 0);
  return dateObj;
};

/**
 * Get the end of a date (23:59:59.999)
 */
export const getEndOfDay = (date: Date | string): Date => {
  const dateObj = typeof date === 'string' ? new Date(date) : new Date(date);
  dateObj.setHours(23, 59, 59, 999);
  return dateObj;
};

/**
 * Check if a date is in the past (before today)
 */
export const isPastDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = getTodayAtMidnight();
  return dateObj < today;
};

/**
 * Check if a date is in the future (after today)
 */
export const isFutureDate = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = getTodayAtMidnight();
  return dateObj > today;
};

/**
 * Format a date for display in calendar (e.g., "Today", "Tomorrow", or date)
 */
export const formatDateForCalendar = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  const tomorrow = addDays(today, 1);

  if (isSameDay(dateObj, today)) {
    return 'Today';
  } else if (isSameDay(dateObj, tomorrow)) {
    return 'Tomorrow';
  } else {
    return formatDateToDDMMMYYYY(dateObj);
  }
};

/**
 * Get date range as array of dates
 */
export const getDateRange = (startDate: Date | string, endDate: Date | string): Date[] => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const dates: Date[] = [];

  let currentDate = new Date(start);
  while (currentDate <= end) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
};

/**
 * Convert HH:mm (24-hour) to user-friendly 12-hour format (e.g., "10:30 AM")
 */
export const formatToTwelveHour = (time24: string): string => {
  if (!time24) return '';
  try {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.warn('Error formatting time:', time24);
    return time24;
  }
};
