// ... existing types ...

export interface Resource {
  id: number;
  serviceId: number;
  serviceName: string;
  name: string;
  description: string;
  enabled: boolean;
  activities: Activity[];
}

export interface Activity {
  id: number;
  code: string;
  name: string;
}



export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  UserTabs: undefined;
  AdminTabs: undefined;
  ServiceDetail: { serviceId: number };
  BookingSummary: { bookingId: string };
  CategoryServices: { activityId: number; activityName: string; city: string; activityCode?: string };
  Wallet: undefined;
};

export interface User {
  id: number;
  phone: string;
  role: 'ROLE_USER' | 'ROLE_ADMIN';
  token: string;
  name?: string;
  email?: string;
  isNewUser?: boolean;
  // Admin specific fields
  businessName?: string;
  businessAddress?: string;
  enabled?: boolean;
  createdAt?: string;
  walletBalance?: number;
}

export interface WalletTransaction {
  id: number;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  description: string;
  createdAt: string;
}

export interface Service {
  id: number;
  name: string;
  location: string;
  rating: number;
  image: string;
  availability?: boolean;
  images?: string[];
  description?: string;
  serviceType?: string;
  contactNumber?: string;
  openingTime?: string;
  closingTime?: string;
  price?: number;
  latitude?: number;
  longitude?: number;
  activities?: string[];
  amenities?: string[];
}

export interface ServiceSearchDto {
  id: number;
  name: string;
  location: string;
  image: string;
  rating: number;
  price?: number;
  availability: boolean;
  activities?: string[];
}

export interface PriceBreakup {
  label: string;
  amount: number;
}

export interface DetailedSlotAvailability {
  slotId: string;
  startTime: string;
  endTime: string;
  status: 'AVAILABLE' | 'BOOKED' | 'DISABLED';
  price: number;
  tags: string[];
  priceBreakup: PriceBreakup[];
  reason: string | null;
}

export interface DetailedSlotResponse {
  slots: DetailedSlotAvailability[];
}

export interface TimeSlot {
  id: number | string;
  startTime: string;
  endTime: string;
  price: number;
  isAvailable?: boolean;
  isBooked?: boolean;
  isPast?: boolean;
  slotId?: number | string;
  tags?: string[];
  priceBreakup?: PriceBreakup[];
  status?: 'AVAILABLE' | 'BOOKED' | 'DISABLED';
  availableCount?: number;
  totalCount?: number;
  durationMinutes?: number;
}

export interface ActivityAvailabilitySlot {
  slotId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalPrice: number;
  availableCount: number;
  totalCount: number;
  available: boolean;
}

export interface ActivityAvailabilityResponse {
  slots: ActivityAvailabilitySlot[];
}

export interface EphemeralSlot {
  slotKey: string | null;
  slotGroupId: string;
  expiresInSeconds?: number;
  startTime: string; // "HH:mm"
  endTime: string;   // "HH:mm"
  durationMinutes: number;
  available: boolean;
  availableCount: number;
  totalCount: number;
  displayPrice: number;
}

export interface EphemeralSlotResponse {
  slots: EphemeralSlot[];
}

export interface SlotAvailability {
  slotId: number;
  available: boolean;
  price: number;
}

export interface BookingRequest {
  serviceId: number;
  resourceId?: number;
  slotIds: (number | string)[];
  bookingDate: string;
}

export interface BookingSlot {
  slotId: number;
  startTime: string;
  endTime: string;
  price: number;
}

export interface BookingResponse {
  id: number;
  reference: string;
  amount: number;
  status: string;
  serviceName: string;
  slotTime: string;
  slots: BookingSlot[];
  bookingDate: string;
  createdAt: string;
}

export interface UserBookingRequest {
  resourceId?: number;
  startTime?: string;
  endTime?: string;
  bookingDate?: string;
  slotKey?: string;
}

export interface UserBookingResponse {
  id: number;
  user: {
    name: string;
    phone: string;
  };
  reference: string;
  amount: number;
  status: string;
  serviceId: number;
  serviceName: string;
  resourceId: number;
  resourceName: string;
  startTime: string;
  endTime: string;
  slotTime: string;
  bookingDate: string;
  createdAt: string;
  amountBreakdown?: AmountBreakdown;
}

export interface AmountBreakdown {
  slotSubtotal: number;
  platformFeePercent?: number;
  platformFee: number;
  totalAmount: number;
  currency: string;
}

export interface DynamicBookingRequest {
  slotKeys: string[];
  idempotencyKey: string;
  allowSplit?: boolean;
}

export interface DynamicBookingResponse {
  id?: number;
  reference?: string;
  serviceId?: number;
  serviceName?: string;
  startTime?: string;
  endTime?: string;
  bookingDate?: string;
  createdAt?: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL_AVAILABLE';
  bookingType?: 'SINGLE_RESOURCE' | 'MULTI_RESOURCE';
  childBookings?: DynamicBookingResponse[];
  message?: string;
  amountBreakdown: AmountBreakdown | null;
}

// New specialized interface for User Bookings
export interface UserBooking {
  id: number;
  serviceName: string;
  resourceId: number;
  resourceName: string;
  status: string;
  date: string;
  slots: Array<{
    startTime: string;
    endTime: string;
  }>;
  totalAmount: number;
  createdAt: string;
  serviceId: number;
  reference?: string;
}

// Keep the general/admin Booking interface for now to avoid breaking other screens
export interface Booking {
  id: number;
  serviceName: string;
  status: string;
  date?: string;
  bookingDate?: string;
  slots?: Array<{
    slotId?: number;
    startTime: string;
    endTime: string;
    price?: number;
  }>;
  totalAmount?: number;
  amount?: number;
  createdAt: string;
  user?: {
    name: string;
    phone: string;
    phone_number?: string;
  };
  reference?: string;
  resourceId?: number;
  resourceName?: string;
  slotTime?: string;
  serviceId?: number;
}

export interface DashboardStats {
  totalBookings: number;
  totalRevenue: number;
  activeServices: number;
  todayBookings: number;
}

// New Service Creation Flow Types
export interface ServiceDetails {
  name: string;
  location: string;
  description: string;
  contactNumber?: string;
  amenities?: string[];
}

export interface ServiceCreationResponse {
  id: number;
  name: string;
  location: string;
  description: string;
  contactNumber?: string;
  images: string[];
  slots: any[];
}

export interface SlotConfig {
  slotId: number;
  startTime: string;
  endTime: string;
  price?: number;
  enabled: boolean;
}

export interface SlotUpdate {
  slotId: number;
  price?: number;
  enabled: boolean;
  priceChanged: boolean;
  enabledChanged: boolean;
}



export interface PageResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ManagerUser {
  id: number;
  phone: string;
  name: string;
  role: string;
  enabled: boolean;
  createdAt: string;
  wallet: {
    walletId: number;
    balance: number;
    status: string;
  };
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
}

export interface WalletBalance {
  balance: number;
}

export interface WalletTransaction {
  id: number;
  walletId: number;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  source: 'TOPUP' | 'BOOKING' | 'REFUND' | 'OTHER';
  referenceId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description: string;
  createdAt: string;
}

export interface PagedWalletTransactions {
  totalElements: number;
  totalPages: number;
  size: number;
  content: WalletTransaction[];
  number: number;
  last: boolean;
  first: boolean;
  empty: boolean;
}


