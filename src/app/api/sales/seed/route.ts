import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const products = [
      { name: 'Fresh Milk', price: 1.5 },
      { name: 'Wheat Flour', price: 4.0 },
      { name: 'Organic Eggs', price: 3.5 },
      { name: 'Refined Sugar', price: 2.0 },
      { name: 'Cooking Oil', price: 6.5 },
      { name: 'Basmati Rice', price: 5.0 },
      { name: 'Tea Leaves', price: 3.0 },
      { name: 'Fresh Bananas', price: 1.2 },
      { name: 'White Bread', price: 1.8 },
      { name: 'Detergent Powder', price: 4.5 },
      { name: 'Hand Soap', price: 2.2 },
      { name: 'Premium Coffee', price: 8.0 },
    ];

    const customers = [
      { name: 'Rohan Sharma', phone: '+919876543210' },
      { name: 'Priya Patel', phone: '+919876543211' },
      { name: 'Amit Kumar', phone: '+919876543212' },
      { name: 'Sneha Gupta', phone: '+919876543213' },
    ];

    const salesToCreate = [];

    // Seed data spanning the last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      // Generate 2 to 6 sales per day to ensure dense records
      const salesCount = Math.floor(Math.random() * 5) + 2;

      for (let s = 0; s < salesCount; s++) {
        const prod = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 4) + 1;
        const price = prod.price;
        const total = qty * price;

        // Payment method distribution: 50% Cash, 35% UPI, 12% Card, 3% Other
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

        // Customer distribution: 40% known customer (repeat checks), 60% anonymous
        let customer = null;
        if (Math.random() < 0.4) {
          customer = customers[Math.floor(Math.random() * customers.length)];
        }

        // Distribute sales across operating hours (8:00 AM to 8:00 PM)
        const saleDate = new Date(date);
        saleDate.setHours(8 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60), 0, 0);

        salesToCreate.push({
          vendorId: session.userId,
          productName: prod.name,
          quantity: qty,
          unitPrice: price,
          totalAmount: total,
          paymentMethod: pMethod,
          customerName: customer ? customer.name : null,
          customerPhone: customer ? customer.phone : null,
          saleDate: saleDate,
        });
      }
    }

    // Clear existing sales for this vendor first
    await db.sale.deleteMany({
      where: { vendorId: session.userId },
    });

    // Bulk insert the seed data
    await db.sale.createMany({
      data: salesToCreate,
    });

    return NextResponse.json({ success: true, count: salesToCreate.length });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: 'An error occurred during seeding.' }, { status: 500 });
  }
}
