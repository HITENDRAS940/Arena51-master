import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';
import { BookingRequest, BookingResponse, UserBookingRequest, UserBookingResponse, EphemeralSlotResponse, DynamicBookingRequest, DynamicBookingResponse, UserBooking, ServiceSearchDto, PagedWalletTransactions } from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let logoutCallback: (() => void) | null = null;

export const setLogoutCallback = (cb: () => void) => {
  logoutCallback = cb;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Smart Production logging
    console.error('🌐 API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    const status = error.response?.status;

    if (status === 401 || status === 403) {
      // Session expired, invalid or forbidden - Production apps force logout here
      console.warn(`🔑 Session error (${status}), performing smart logout...`);
      await AsyncStorage.multiRemove(['token', 'user']);

      if (logoutCallback) {
        logoutCallback();
      }

      // Special handling for 403: Silent failure as requested (no error UI shown)
      if (status === 403) {
        // Halt current request execution and wait for AuthContext to redirect/unmount
        return new Promise(() => { });
      }
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  sendOTP: (phone: string) => api.post('/auth/request-otp', { phone }),
  verifyOTP: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }),
};

// User APIs
export const userAPI = {
  setName: (name: string) => api.post('/user/setname', { name }),
};

// Service APIs
export const serviceAPI = {
  getAllServices: () => api.get('/services'),
  getServiceById: (id: number) => api.get(`/services/${id}`),
  getAvailableSlots: (serviceId: number, date: string, resourceId?: number) => Promise.resolve({ data: [] }),
  getSlotAvailability: (serviceId: number, date: string, resourceId?: number) => Promise.resolve({ data: [] }),
  getLowestPrice: (serviceId: number) => Promise.resolve({ data: 0 }),
  getResourcesByServiceId: (serviceId: number) => api.get(`/services/${serviceId}/resources`),
  getActivityAvailability: (serviceId: number, activityCode: string, date: string) =>
    api.get<EphemeralSlotResponse>(`/api/slots/availability`, { params: { serviceId, activityCode, date } }),
  getResourceDetailedAvailability: (resourceId: number, date: string) => api.get(`/resources/${resourceId}/availability/detailed?date=${date}`),
  searchByAvailability: (params: {
    date: string;
    startTime: string;
    endTime: string;
    city: string;
    activityCode?: string
  }) => api.get<ServiceSearchDto[]>('/services/search-by-availability', { params }),

  getActivities: () => api.get('/services/activity'),
  searchServices: (keyword: string, city: string, activity?: string) =>
    api.get('/services/search', { params: { keyword, city, activity } }),
  getCities: () => api.get('/services/cities'),
  getServicesByCity: (city: string, page: number = 0, size: number = 6, date?: string) => api.get('/services/by-city', { params: { city, page, size, date } }),
  getServicesByActivity: (activityId: number, city: string, page: number = 0, size: number = 10, date?: string) =>
    api.get(`/services/${activityId}/activity`, { params: { city, page, size, date } }),
  getSlotStatus: (serviceId: number, date: string) => Promise.resolve({ data: {} } as any),
};

// Booking APIs
export const bookingAPI = {
  createBooking: (data: DynamicBookingRequest) => api.post<DynamicBookingResponse>('/api/slots/book', data),
  getUserBookings: () => api.get<UserBooking[]>('/user/bookings'),
  cancelBooking: (id: number) => Promise.resolve({ data: {} }),
};

// Wallet APIs
export const walletAPI = {
  getBalance: () => api.get('api/wallet/balance'),
  getTransactions: () => api.get<PagedWalletTransactions>('api/wallet/transactions'),
};

// Admin APIs
export const adminAPI = {
  getDashboardStats: () => Promise.resolve({ data: {} } as any),
  getAllBookings: () => Promise.resolve({ data: [] } as any),
  createService: (data: any) => Promise.resolve({ data: {} } as any),
  updateService: (id: number, data: any) => Promise.resolve({ data: {} } as any),
  deleteService: (id: number) => Promise.resolve({ data: {} } as any),
  updateSlotPricing: (data: any) => Promise.resolve({ data: {} } as any),

  // Get services for specific admin
  getAdminServices: (userId: number) => Promise.resolve({ data: [] } as any),

  // Get bookings for a specific service
  getServiceBookings: async (serviceId: number, date?: string) => Promise.resolve({ data: { bookings: [] } } as any),

  // New Service Creation Flow APIs
  createServiceDetails: (data: { name: string; location: string; description: string; contactNumber?: string }) => Promise.resolve({ data: {} } as any),
  updateServiceDetails: (serviceId: number, data: { name: string; location: string; description: string; contactNumber?: string }) => Promise.resolve({ data: {} } as any),
  getServiceSlots: (serviceId: number) => Promise.resolve({ data: { slots: [] } } as any),
  uploadServiceImages: (serviceId: number, formData: FormData) => Promise.resolve({ data: {} } as any),
  deleteServiceImages: (serviceId: number, imageUrls: string[]) => Promise.resolve({ data: {} } as any),
  updateSlotPrice: (serviceId: number, slotId: number, price: number) => Promise.resolve({ data: {} } as any),
  enableSlot: (serviceId: number, slotId: number) => Promise.resolve({ data: {} } as any),
  disableSlot: (serviceId: number, slotId: number) => Promise.resolve({ data: {} } as any),
  setServiceAvailable: (serviceId: number) => Promise.resolve({ data: {} } as any),
  setServiceNotAvailable: (serviceId: number) => Promise.resolve({ data: {} } as any),
  getServiceAvailability: (serviceId: number) => Promise.resolve({ data: {} } as any),

  // Manual Booking by Admin
  createManualBooking: (data: { serviceId: number; slotIds: number[]; bookingDate: string }) => Promise.resolve({ data: {} } as any),

  // Disable Slot for a Date (One-off)
  disableSlotForDate: (data: { serviceId: number; slotId: number; date: string; reason: string }) => Promise.resolve({ data: {} } as any),

  getDisabledSlotsForDate: (serviceId: number, date: string) => Promise.resolve({ data: [] } as any),

  // User Management for Manager
  getUsers: (page: number = 0, size: number = 10) => api.get(`/manager/users`, { params: { page, size } }),
};



// Export combined API object for convenience
export { api };
export default {
  ...api,
  auth: authAPI,
  user: userAPI,
  service: serviceAPI,
  booking: bookingAPI,
  admin: adminAPI,
};
