export type PaymentOption = 'full' | 'split-2' | 'split-3';

export interface PaymentDetails {
  type: PaymentOption;
  label: string;
  amount: number;
  splitAmount?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  date: string;
  price: number;
}

export interface ReattunementOption {
  id: string;
  title: string;
  price: number;
}

export interface CartItem {
  id: string;
  type: 'course' | 'reattunement';
  price: number;
}

export interface CustomerData {
  name: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}
