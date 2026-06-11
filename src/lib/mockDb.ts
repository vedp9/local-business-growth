/**
 * Client-side mock database using localStorage.
 * This is used as a fallback when API endpoints are not available (e.g. static hosting on GitHub Pages).
 */

export interface MockSale {
  id: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paymentMethod: string;
  customerName: string | null;
  customerPhone: string | null;
  saleDate: string;
  createdAt: string;
}

export interface MockUser {
  id: number;
  email: string;
  storeName: string;
  passwordHash: string;
}

const DEFAULT_USER = {
  email: 'admin@store.com',
  password: 'admin123',
  storeName: 'Corner Grocery Store',
};

// Helper to encode a string to base64url
function base64urlEncode(str: string): string {
  if (typeof btoa === 'undefined') return '';
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// Generate a dummy JWT structure that has our storeName and email in the payload
function generateMockToken(email: string, storeName: string): string {
  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64urlEncode(JSON.stringify({ userId: 1, email, storeName }));
  const signature = 'mocksignature';
  return `${header}.${payload}.${signature}`;
}

export const mockDb = {
  isStaticMode(): boolean {
    if (typeof window === 'undefined') return false;
    // Always fallback to mock mode if not running on the development port 3000
    // or if we are hosted on github.io
    return (
      window.location.hostname.includes('github.io') ||
      !window.location.origin.includes(':3000')
    );
  },

  setSessionCookie(email: string, storeName: string) {
    if (typeof document === 'undefined') return;
    const token = generateMockToken(email, storeName);
    document.cookie = `session=${token}; path=/; max-age=86400; SameSite=Strict`;
  },

  clearSessionCookie() {
    if (typeof document === 'undefined') return;
    document.cookie = 'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict';
  },

  getUsers(): MockUser[] {
    if (typeof window === 'undefined') return [];
    try {
      const usersStr = localStorage.getItem('local_users');
      return usersStr ? JSON.parse(usersStr) : [];
    } catch {
      return [];
    }
  },

  saveUsers(users: MockUser[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem('local_users', JSON.stringify(users));
  },

  login(email: string, password: string): { success: boolean; error?: string; storeName?: string } {
    // 1. Check default credentials
    if (email === DEFAULT_USER.email && password === DEFAULT_USER.password) {
      this.setSessionCookie(email, DEFAULT_USER.storeName);
      return { success: true, storeName: DEFAULT_USER.storeName };
    }

    // 2. Check registered users in localStorage
    const users = this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user || user.passwordHash !== password) { // Storing password plain-text for simple client-side mock
      return { success: false, error: 'Invalid email or password.' };
    }

    this.setSessionCookie(email, user.storeName);
    return { success: true, storeName: user.storeName };
  },

  register(email: string, password: string, storeName: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    
    // Check if default email or existing email is taken
    if (
      email.toLowerCase() === DEFAULT_USER.email.toLowerCase() ||
      users.some((u) => u.email.toLowerCase() === email.toLowerCase())
    ) {
      return { success: false, error: 'Email address already registered.' };
    }

    const newUser: MockUser = {
      id: Date.now(),
      email,
      storeName,
      passwordHash: password, // Simple plain text match for static client demonstration
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setSessionCookie(email, storeName);
    return { success: true };
  },

  getSales(filter: 'today' | '7days' | '30days' | 'all' = 'all'): MockSale[] {
    if (typeof window === 'undefined') return [];
    
    let sales: MockSale[] = [];
    try {
      const salesStr = localStorage.getItem('local_sales');
      if (salesStr) {
        sales = JSON.parse(salesStr);
      } else {
        // Auto-seed if empty
        sales = this.seedSales();
      }
    } catch {
      sales = this.seedSales();
    }

    // Filter sales
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return sales.filter((sale) => {
      const saleTime = new Date(sale.saleDate).getTime();
      if (filter === 'today') {
        return saleTime >= startOfToday;
      }
      if (filter === '7days') {
        const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
        return saleTime >= sevenDaysAgo;
      }
      if (filter === '30days') {
        const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
        return saleTime >= thirtyDaysAgo;
      }
      return true;
    }).sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
  },

  addSale(saleData: Omit<MockSale, 'id' | 'createdAt' | 'totalAmount'>): MockSale {
    if (typeof window === 'undefined') {
      throw new Error('Not running in browser environment.');
    }

    const sales: MockSale[] = [];
    try {
      const salesStr = localStorage.getItem('local_sales');
      if (salesStr) sales.push(...JSON.parse(salesStr));
    } catch {}

    const newSale: MockSale = {
      ...saleData,
      id: Date.now() + Math.floor(Math.random() * 1000),
      totalAmount: saleData.quantity * saleData.unitPrice,
      createdAt: new Date().toISOString(),
    };

    sales.push(newSale);
    localStorage.setItem('local_sales', JSON.stringify(sales));
    return newSale;
  },

  seedSales(): MockSale[] {
    if (typeof window === 'undefined') return [];

    const products = [
      { name: 'Fresh Milk', price: 1.50 },
      { name: 'Wheat Flour', price: 4.00 },
      { name: 'Organic Eggs', price: 3.50 },
      { name: 'Refined Sugar', price: 2.00 },
      { name: 'Cooking Oil', price: 6.50 },
      { name: 'Basmati Rice', price: 5.00 },
      { name: 'Tea Leaves', price: 3.00 },
      { name: 'Fresh Bananas', price: 1.20 },
      { name: 'White Bread', price: 1.80 },
      { name: 'Detergent Powder', price: 4.50 },
      { name: 'Hand Soap', price: 2.20 },
      { name: 'Premium Coffee', price: 8.00 },
    ];

    const customers = [
      { name: 'Rohan Sharma', phone: '+919876543210' },
      { name: 'Priya Patel', phone: '+919876543211' },
      { name: 'Amit Kumar', phone: '+919876543212' },
      { name: 'Sneha Gupta', phone: '+919876543213' },
    ];

    const salesToCreate: MockSale[] = [];

    // Seed data spanning the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Generate 3 to 7 sales per day for demo data richness
      const salesCount = Math.floor(Math.random() * 5) + 3;

      for (let s = 0; s < salesCount; s++) {
        const prod = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 4) + 1;
        const price = prod.price;
        const total = qty * price;

        let pMethod = 'Cash';
        const pRand = Math.random();
        if (pRand < 0.50) {
          pMethod = 'Cash';
        } else if (pRand < 0.85) {
          pMethod = 'UPI';
        } else if (pRand < 0.97) {
          pMethod = 'Card';
        } else {
          pMethod = 'Other';
        }

        let customer = null;
        if (Math.random() < 0.40) {
          customer = customers[Math.floor(Math.random() * customers.length)];
        }

        const saleDate = new Date(date);
        saleDate.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);

        salesToCreate.push({
          id: i * 100 + s,
          productName: prod.name,
          quantity: qty,
          unitPrice: price,
          totalAmount: total,
          paymentMethod: pMethod,
          customerName: customer ? customer.name : null,
          customerPhone: customer ? customer.phone : null,
          saleDate: saleDate.toISOString(),
          createdAt: saleDate.toISOString(),
        });
      }
    }

    localStorage.setItem('local_sales', JSON.stringify(salesToCreate));
    return salesToCreate;
  },
};
