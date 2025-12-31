/**
 * Slot Utilities
 * Shared utility functions for slot management, formatting, and calculations
 */

import { SlotConfig } from '../types';

export interface ServiceSlot {
  id: number;
  startTime: string;
  endTime: string;
  price: number;
  enabled: boolean;
  isBooked?: boolean;
}

/**
 * Format time from HH:MM:SS to readable format (12-hour)
 * @param time - Time string in HH:MM:SS format
 * @returns Formatted time string (e.g., "9 AM", "2 PM")
 */
export const formatTime = (time: string): string => {
  const [hours] = time.split(':');
  const hour = parseInt(hours);

  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
};

/**
 * Format time range from two time strings
 * @param startTime - Start time in HH:MM:SS format
 * @param endTime - End time in HH:MM:SS format
 * @returns Formatted time range (e.g., "9 AM - 10 AM")
 */
export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
};

/**
 * Sort slots by ID to maintain chronological order (1-24)
 * @param slots - Array of slots to sort
 * @returns Sorted array of slots
 */
export const sortSlotsByTime = <T extends { id: number }>(slots: T[]): T[] => {
  return [...slots].sort((a, b) => a.id - b.id);
};

/**
 * Sort slot configs by slotId to maintain chronological order (1-24)
 * @param slots - Array of slot configs to sort
 * @returns Sorted array of slot configs
 */
export const sortSlotConfigsByTime = (slots: SlotConfig[]): SlotConfig[] => {
  return [...slots].sort((a, b) => a.slotId - b.slotId);
};

/**
 * Map database slots to SlotConfig format
 * @param dbSlots - Slots from database
 * @returns Mapped and sorted SlotConfig array
 */
export const mapDbSlotsToConfig = (dbSlots: any[]): SlotConfig[] => {
  const mapped = dbSlots.map((dbSlot: any, index: number) => ({
    slotId: dbSlot.id || dbSlot.slotId || (index + 1),
    startTime: dbSlot.startTime,
    endTime: dbSlot.endTime,
    price: dbSlot.price,
    enabled: dbSlot.enabled === true,
  }));

  return sortSlotConfigsByTime(mapped);
};

/**
 * Get slot status color based on enabled and booked state
 * @param enabled - Whether slot is enabled
 * @param isBooked - Whether slot is booked
 * @returns Object with background and border colors
 */
export const getSlotColors = (enabled: boolean, isBooked?: boolean) => {
  if (!enabled) {
    return {
      backgroundColor: '#E5E7EB',
      borderColor: '#9CA3AF',
      textColor: '#6B7280',
    };
  }

  if (isBooked) {
    return {
      backgroundColor: '#FEE2E2',
      borderColor: '#EF4444',
      textColor: '#991B1B',
    };
  }

  return {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    textColor: '#047857',
  };
};

/**
 * Count enabled slots
 * @param slots - Array of slots
 * @returns Number of enabled slots
 */
export const countEnabledSlots = <T extends { enabled: boolean }>(slots: T[]): number => {
  return slots.filter(s => s.enabled).length;
};

/**
 * Count booked slots (only from enabled slots)
 * @param slots - Array of slots with booking info
 * @returns Number of booked slots
 */
export const countBookedSlots = (slots: ServiceSlot[]): number => {
  return slots.filter(s => s.enabled && s.isBooked).length;
};

/**
 * Calculate available slots (enabled but not booked)
 * @param slots - Array of slots with booking info
 * @returns Number of available slots
 */
export const countAvailableSlots = (slots: ServiceSlot[]): number => {
  const enabled = countEnabledSlots(slots);
  const booked = countBookedSlots(slots);
  return enabled - booked;
};

/**
 * Get booked slot IDs from bookings
 * @param bookings - Array of bookings
 * @returns Set of booked slot IDs
 */
export const getBookedSlotIds = (bookings: any[]): Set<number> => {
  return new Set(
    bookings.flatMap(b => (b.slots || []).map((s: any) => s.slotId))
  );
};

/**
 * Map slots with booking information
 * @param slots - Array of slots
 * @param bookedSlotIds - Set of booked slot IDs
 * @returns Slots with isBooked property
 */
export const mapSlotsWithBookingInfo = (
  slots: ServiceSlot[],
  bookedSlotIds: Set<number>
): ServiceSlot[] => {
  return sortSlotsByTime(slots).map(slot => ({
    ...slot,
    isBooked: bookedSlotIds.has(slot.id),
  }));
};

/**
 * Default 24-hour slot configuration
 */
export const DEFAULT_SLOTS: SlotConfig[] = [
  { slotId: 1, startTime: "00:00:00", endTime: "01:00:00", enabled: true },
  { slotId: 2, startTime: "01:00:00", endTime: "02:00:00", enabled: true },
  { slotId: 3, startTime: "02:00:00", endTime: "03:00:00", enabled: true },
  { slotId: 4, startTime: "03:00:00", endTime: "04:00:00", enabled: true },
  { slotId: 5, startTime: "04:00:00", endTime: "05:00:00", enabled: true },
  { slotId: 6, startTime: "05:00:00", endTime: "06:00:00", enabled: true },
  { slotId: 7, startTime: "06:00:00", endTime: "07:00:00", enabled: true },
  { slotId: 8, startTime: "07:00:00", endTime: "08:00:00", enabled: true },
  { slotId: 9, startTime: "08:00:00", endTime: "09:00:00", enabled: true },
  { slotId: 10, startTime: "09:00:00", endTime: "10:00:00", enabled: true },
  { slotId: 11, startTime: "10:00:00", endTime: "11:00:00", enabled: true },
  { slotId: 12, startTime: "11:00:00", endTime: "12:00:00", enabled: true },
  { slotId: 13, startTime: "12:00:00", endTime: "13:00:00", enabled: true },
  { slotId: 14, startTime: "13:00:00", endTime: "14:00:00", enabled: true },
  { slotId: 15, startTime: "14:00:00", endTime: "15:00:00", enabled: true },
  { slotId: 16, startTime: "15:00:00", endTime: "16:00:00", enabled: true },
  { slotId: 17, startTime: "16:00:00", endTime: "17:00:00", enabled: true },
  { slotId: 18, startTime: "17:00:00", endTime: "18:00:00", enabled: true },
  { slotId: 19, startTime: "18:00:00", endTime: "19:00:00", enabled: true },
  { slotId: 20, startTime: "19:00:00", endTime: "20:00:00", enabled: true },
  { slotId: 21, startTime: "20:00:00", endTime: "21:00:00", enabled: true },
  { slotId: 22, startTime: "21:00:00", endTime: "22:00:00", enabled: true },
  { slotId: 23, startTime: "22:00:00", endTime: "23:00:00", enabled: true },
  { slotId: 24, startTime: "23:00:00", endTime: "00:00:00", enabled: true },
];

/**
 * Validate if a time string is in HH:MM:SS format
 * @param time - Time string to validate
 * @returns True if valid
 */
export const isValidTimeFormat = (time: string): boolean => {
  return /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time);
};

/**
 * Calculate total price for selected slots
 * @param slots - Array of selected slots
 * @returns Total price
 */
export const calculateTotalPrice = (slots: ServiceSlot[]): number => {
  return slots.reduce((sum, slot) => sum + (slot.price || 0), 0);
};
