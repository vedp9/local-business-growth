import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPassword, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const vendor = await db.vendor.findUnique({ where: { email } });
    if (!vendor) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
    }

    const isMatch = verifyPassword(password, vendor.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
    }

    const token = signToken({
      userId: vendor.id,
      email: vendor.email,
      storeName: vendor.storeName,
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true, storeName: vendor.storeName });
  } catch (error: any) {
    return NextResponse.json({ error: 'An error occurred during login.' }, { status: 500 });
  }
}
