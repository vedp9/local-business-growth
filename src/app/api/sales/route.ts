import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let whereClause: any = { vendorId: session.userId };

    if (filter === 'today') {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      whereClause.saleDate = {
        gte: start,
        lte: end,
      };
    } else if (filter === '7days') {
      const start = new Date();
      start.setDate(start.getDate() - 7);
      whereClause.saleDate = {
        gte: start,
      };
    } else if (filter === '30days') {
      const start = new Date();
      start.setDate(start.getDate() - 30);
      whereClause.saleDate = {
        gte: start,
      };
    }

    const sales = await db.sale.findMany({
      where: whereClause,
      orderBy: { saleDate: 'desc' },
    });

    return NextResponse.json({ sales });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred fetching sales.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productName, quantity, unitPrice, paymentMethod, customerName, customerPhone, saleDate } = body;

    if (!productName || quantity === undefined || unitPrice === undefined) {
      return NextResponse.json({ error: 'Product name, quantity, and unit price are required.' }, { status: 400 });
    }

    const qty = parseInt(quantity, 10);
    const price = parseFloat(unitPrice);

    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: 'Quantity must be a positive integer.' }, { status: 400 });
    }

    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'Unit price must be a non-negative number.' }, { status: 400 });
    }

    const allowedPayments = ['Cash', 'UPI', 'Card', 'Other'];
    const pMethod = allowedPayments.includes(paymentMethod) ? paymentMethod : 'Cash';

    const date = saleDate ? new Date(saleDate) : new Date();

    const newSale = await db.sale.create({
      data: {
        vendorId: session.userId,
        productName,
        quantity: qty,
        unitPrice: price,
        totalAmount: qty * price,
        paymentMethod: pMethod,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        saleDate: date,
      },
    });

    return NextResponse.json({ success: true, sale: newSale });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred creating the sale.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get('id');

    if (!idParam) {
      return NextResponse.json({ error: 'Sale ID is required.' }, { status: 400 });
    }

    const saleId = parseInt(idParam, 10);
    if (isNaN(saleId)) {
      return NextResponse.json({ error: 'Invalid Sale ID.' }, { status: 400 });
    }

    const sale = await db.sale.findUnique({
      where: { id: saleId },
    });

    if (!sale) {
      return NextResponse.json({ error: 'Sale record not found.' }, { status: 404 });
    }

    if (sale.vendorId !== session.userId) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 });
    }

    await db.sale.delete({
      where: { id: saleId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred deleting the sale.' }, { status: 500 });
  }
}
