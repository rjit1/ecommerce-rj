declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: {
    address: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface CreateOrderData {
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResponse {
  success: boolean;
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt: string;
  };
  error?: string;
}

export interface VerifyPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  order: any;
  error?: string;
}

export const createRazorpayOrder = async (orderData: CreateOrderData): Promise<CreateOrderResponse> => {
  try {
    const response = await fetch('/api/payment/razorpay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create payment order');
    }

    return result;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const verifyRazorpayPayment = async (paymentData: VerifyPaymentData): Promise<VerifyPaymentResponse> => {
  try {
    const response = await fetch('/api/payment/razorpay', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Payment verification failed');
    }

    return result;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

export const initializeRazorpay = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const openRazorpayCheckout = (options: RazorpayOptions) => {
  if (typeof window !== 'undefined' && window.Razorpay) {
    const rzp = new window.Razorpay(options);
    rzp.open();
  } else {
    throw new Error('Razorpay SDK not loaded');
  }
};