
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  image: string;
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  discount: number;
  type: 'sale' | 'purchase'; // purchase = stock in, sale = stock out
}

export interface StoreInfo {
  name: string;
  address: string;
  phone: string;
}

export type View = 'dashboard' | 'inventory' | 'pos' | 'history' | 'ai-insights' | 'settings';
