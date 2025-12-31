import { api } from './api';
import { CashfreeOrderRequest, CashfreeOrderResponse } from '../types';

/**
 * Payment API Service
 * Handles interaction with backend for payment order creation.
 */
export const paymentAPI = {
    /**
     * Creates a payment order via backend.
     * NOTE: Order creation must be done from backend to secure secret keys.
     * @param payload Order details
     */
    createOrder: async (payload: CashfreeOrderRequest): Promise<CashfreeOrderResponse> => {
        try {
            // Calling the backend endpoint which internally calls Cashfree PGCreateOrder
            const response = await api.post<CashfreeOrderResponse>('/api/payment/create-order', payload);
            return response.data;
        } catch (error) {
            console.error('SERVER: Error creating order:', error);
            throw error;
        }
    },
};

export default paymentAPI;
