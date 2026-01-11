/**
 * Payment utilities for handling payment details.
 */

export interface PaymentDetails {
  method: string;
  transactionId: string;
  amount: number;
  cardNumber?: string;
  upiId?: string;
}

const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Wallet'
];

const UPI_IDS = [
  'user@paytm',
  'user@gpay',
  'user@phonepe',
  'user@amazonpay',
  'user@ybl'
];

/**
 * Generates a random transaction ID
 */
const generateTransactionId = (): string => {
  const timestamp = Date.now().toString();
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN${timestamp}${randomSuffix}`;
};

/**
 * Generates a mock card number (for display only)
 */
const generateMockCardNumber = (): string => {
  // Generate a mock card number starting with 4 (Visa) or 5 (Mastercard)
  const prefix = Math.random() > 0.5 ? '4' : '5';
  const remaining = Array.from({ length: 15 }, () => Math.floor(Math.random() * 10)).join('');
  return `${prefix}${remaining}`;
};

/**
 * Generates random payment details for booking
 */
export const generateRandomPaymentDetails = (amount: number): PaymentDetails => {
  const method = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];
  const transactionId = generateTransactionId();

  const basePayment: PaymentDetails = {
    method,
    transactionId,
    amount,
  };

  // Add method-specific details
  switch (method) {
    case 'UPI':
      basePayment.upiId = UPI_IDS[Math.floor(Math.random() * UPI_IDS.length)];
      break;
    case 'Credit Card':
    case 'Debit Card':
      basePayment.cardNumber = `****-****-****-${generateMockCardNumber().slice(-4)}`;
      break;
    default:
      // For Net Banking and Wallet, no additional details needed
      break;
  }

  return basePayment;
};

/**
 * Formats payment method for display
 */
export const formatPaymentMethod = (paymentDetails: PaymentDetails): string => {
  switch (paymentDetails.method) {
    case 'UPI':
      return `${paymentDetails.method} (${paymentDetails.upiId})`;
    case 'Credit Card':
    case 'Debit Card':
      return `${paymentDetails.method} (${paymentDetails.cardNumber})`;
    default:
      return paymentDetails.method;
  }
};

/**
 * Simulates payment processing delay
 */
export const simulatePaymentProcessing = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Simulate 1-3 seconds processing time
    const delay = Math.random() * 2000 + 1000;
    setTimeout(() => {
      // 95% success rate for mock payments
      const success = Math.random() > 0.05;
      resolve(success);
    }, delay);
  });
};

/**
 * Simulates Cashfree payment gateway flow
 */
export const simulateCashfreePayment = (amount: number): Promise<{ success: boolean; paymentId?: string }> => {
  return new Promise((resolve) => {
    // Simulate gateway initialization
    setTimeout(() => {
      // Simulate user interaction and processing
      setTimeout(() => {
        const success = true;
        const paymentId = `CF_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        resolve({ success, paymentId });
      }, 2000);
    }, 1000);
  });
};
