import { format, isToday, isTomorrow, isYesterday } from 'date-fns';

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isToday(dateObj)) {
    return 'Today';
  }

  if (isTomorrow(dateObj)) {
    return 'Tomorrow';
  }

  if (isYesterday(dateObj)) {
    return 'Yesterday';
  }

  return format(dateObj, 'dd MMM yyyy');
};

export const formatTime = (time: string): string => {
  // Assume time is in HH:mm format
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minutes} ${ampm}`;
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const calculateTimeDifference = (startTime: string, endTime: string): number => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  return (endMinutes - startMinutes) / 60; // Return hours
};

export const isSlotAvailable = (slotTime: string, bookedSlots: string[]): boolean => {
  return !bookedSlots.includes(slotTime);
};

export const generateTimeSlots = (
  startTime: string = '06:00',
  endTime: string = '22:00',
  interval: number = 1
): string[] => {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
    slots.push(timeStr);

    currentMin += interval * 60;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return slots;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const calculateBookingTotal = (slots: Array<{ price: number }>): number => {
  return slots.reduce((total, slot) => total + slot.price, 0);
};

export const getStatusColor = (status: string): string => {
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
      return '#10B981';
    case 'CANCELLED':
      return '#EF4444';
    case 'PENDING':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
};

export const sortBookingsByDate = (bookings: any[]): any[] => {
  return [...bookings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const filterBookingsByStatus = (bookings: any[], status: string): any[] => {
  return bookings.filter(booking => booking.status.toUpperCase() === status.toUpperCase());
};

export const getNextAvailableDate = (): Date => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

export const isBookingCancellable = (bookingDate: string): boolean => {
  const booking = new Date(bookingDate);
  const now = new Date();
  const diffHours = (booking.getTime() - now.getTime()) / (1000 * 60 * 60);

  // Allow cancellation if booking is at least 2 hours in the future
  return diffHours >= 2;
};

export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
