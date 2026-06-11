import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password, storeName } = await request.json();

    if (!email || !password || !storeName) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const existingVendor = await db.vendor.findUnique({ where: { email } });
    if (existingVendor) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 400 });
    }

    const hashedPassword = hashPassword(password);
    const newVendor = await db.vendor.create({
      data: {
        email,
        password: hashedPassword,
        storeName,
      },
    });

    const token = signToken({
      userId: newVendor.id,
      email: newVendor.email,
      storeName: newVendor.storeName,
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

    return NextResponse.json({ success: true, storeName: newVendor.storeName });
  } catch (error: any) {
    return NextResponse.json({ error: 'An error occurred during registration.' }, { status: 500 });
  }
}
