import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/config';
import { EphemeralSlotResponse, DynamicBookingRequest, DynamicBookingResponse, UserBooking, ServiceSearchDto, PagedWalletTransactions, OAuthLoginRequest, OAuthLoginResponse, BookingStatusResponse } from '../types';

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
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      const storedToken = await AsyncStorage.getItem('token');
      // Handle various "empty" token states
      const hasNoToken = !storedToken || storedToken === 'null' || storedToken === 'undefined' || storedToken === '';

      if (hasNoToken) {
        if (status === 403) {
          // Return a robust empty structure to prevent crashes in screens
          return Promise.resolve({
            data: { content: [], data: [], balance: 0 },
            status: 403,
            __isSilencedError: true
          });
        }
      } else {

        await AsyncStorage.multiRemove(['token', 'user']);
        if (logoutCallback) logoutCallback();
      }
    }



    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  // Phone OTP (existing)
  sendOTP: (phone: string) => api.post('/auth/request-otp', { phone }),
  verifyOTP: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }),

  // Email OTP (new)
  sendEmailOTP: (email: string) => api.post('/auth/request-email-otp', { email }),
  verifyEmailOTP: (email: string, otp: string) => api.post('/auth/verify-email-otp', { email, otp }),

  // OAuth (new)
  oauthLogin: (data: OAuthLoginRequest) =>
    api.post<OAuthLoginResponse>('/auth/oauth/login', data),

  // Phone Linking (new) - for post-OAuth phone verification
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/user/profile'),
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
  getLastBooking: () => api.get<UserBooking>('/user/bookings/last'),
  cancelBooking: (id: number) => Promise.resolve({ data: {} }),
  cancelBookingByReference: (reference: string) => api.post(`/api/slots/cancel/${reference}`),
  getBookingStatus: (id: number) => api.get<BookingStatusResponse>(`/api/razorpay/booking-status/${id}`),
  getPendingBookings: () => api.get<UserBooking[]>('/user/bookings', { params: { status: 'AWAITING_CONFIRMATION' } }),
};

// Wallet APIs
export const walletAPI = {
  getBalance: () => api.get('api/wallet/balance'),
  getTransactions: () => api.get<PagedWalletTransactions>('api/wallet/transactions'),
};

// Razorpay APIs
export const razorpayAPI = {
  createOrder: (bookingId: number) => api.post(`/api/razorpay/create-order/${bookingId}`),
  verifyPayment: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    bookingId: number;
  }) => api.post('/api/razorpay/verify-payment', data),
  getPaymentDetails: (paymentId: string) => api.get(`/api/razorpay/payment/${paymentId}`),
  getOrderDetails: (orderId: string) => api.get(`/api/razorpay/order/${orderId}`),
};

// Location APIs
export const locationAPI = {
  calculateDistance: (params: { serviceId: number; userLatitude: number; userLongitude: number }) =>
    api.post('/api/location/calculate-distance', params),
  filterServicesByDistance: (params: {
    userLatitude: number;
    userLongitude: number;
    maxDistanceKm: number;
    minDistanceKm: number;
    city: string;
  }) => api.post('/api/location/filter-services-by-distance', params),
};

// Export combined API object for convenience
export { api };
export default {
  ...api,
  auth: authAPI,
  user: userAPI,
  service: serviceAPI,
  location: locationAPI,
  booking: bookingAPI,
  razorpay: razorpayAPI,
};
