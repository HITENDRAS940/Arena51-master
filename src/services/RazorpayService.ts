import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { razorpayAPI } from './api';
import { Alert } from 'react-native';

class RazorpayService {
    /**
     * Initialize payment for a booking and verify on backend
     */
    async openCheckout(bookingId: number, orderData: any) {
        console.log(`RazorpayService: Opening checkout for booking ${bookingId}`, orderData);
        try {
            // 1. Prepare User Info for prefill
            let user = {};
            try {
                const userStr = await AsyncStorage.getItem('user');
                user = userStr ? JSON.parse(userStr) : {};
            } catch (e) {
                console.warn('RazorpayService: Could not load user data from storage', e);
            }

            // 2. Razorpay Options
            const options = {
                description: `Booking #${bookingId}`,
                image: 'https://your-logo-url.com/logo.png', // Replace with dynamic app logo if available
                currency: orderData.currency || 'INR',
                key: orderData.keyId,
                amount: orderData.amount,
                order_id: orderData.orderId,
                name: 'Hyper Booking',
                prefill: {
                    email: (user as any).email || '',
                    contact: (user as any).phone || '',
                    name: (user as any).name || '',
                },
                theme: {
                    color: '#1E1B4B', // Hyper dark navy
                },
                modal: {
                    ondismiss: () => {
                        console.log('RazorpayService: Payment modal dismissed by user');
                    },
                },
            };

            // 3. Open Razorpay Checkout
            console.log('RazorpayService: Calling RazorpayCheckout.open...');
            const paymentResponse = await RazorpayCheckout.open(options);

            // 4. Handle Success Response from Razorpay (Callback)
            console.log('RazorpayService: Razorpay success response:', paymentResponse);

            // 5. Backend Verification (DO NOT TRUST FRONTEND ALONE)
            console.log('RazorpayService: Starting backend verification...');
            try {
                await razorpayAPI.verifyPayment({
                    razorpayOrderId: paymentResponse.razorpay_order_id,
                    razorpayPaymentId: paymentResponse.razorpay_payment_id,
                    razorpaySignature: paymentResponse.razorpay_signature,
                    bookingId: bookingId,
                });
                console.log('RazorpayService: Backend verification successful');

                return {
                    status: 'SUCCESS',
                    paymentData: paymentResponse,
                    orderId: orderData.orderId,
                };
            } catch (verifyError: any) {
                console.error('RazorpayService: Backend verification failed:', verifyError);
                throw new Error(verifyError.response?.data?.message || 'Payment verification failed on server');
            }
        } catch (error: any) {
            console.error('RazorpayService: Checkout failed with error:', error);

            // 1. Check for explicit user cancellation (error code 2)
            if (error.code === 2) {
                console.log('RazorpayService: Payment cancelled by user');
                return { status: 'CANCELLED' };
            }

            // 2. Map "BAD_REQUEST_ERROR" during "payment_authentication" to CANCELLED
            // This happens when the user presses BACK during the UPI/Card auth screen.
            const innerError = error?.error || error;
            if (
                innerError?.code === 'BAD_REQUEST_ERROR' &&
                innerError?.step === 'payment_authentication'
            ) {
                console.log('RazorpayService: User aborted authentication flow (Back press)');
                return { status: 'CANCELLED' };
            }

            // 3. Other genuine errors (Network, Invalid Key, etc.)
            return {
                status: 'FAILED',
                error: innerError?.description || error.message || 'Payment failed'
            };
        }
    }

    async initiatePayment(bookingId: number, bookingData: any) {
        try {
            console.log('RazorpayService: Creating order for bookingId:', bookingId);
            const orderResponse = await razorpayAPI.createOrder(bookingId);
            const orderData = orderResponse.data;
            return await this.openCheckout(bookingId, orderData);
        } catch (error: any) {
            console.error('Payment initiation failed:', error);
            throw error;
        }
    }

    /**
     * Get payment details (if needed)
     */
    async getPaymentDetails(paymentId: string) {
        try {
            const response = await razorpayAPI.getPaymentDetails(paymentId);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch payment details:', error);
            throw error;
        }
    }
}

export default new RazorpayService();
