import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'session',
      value: '',
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred during logout.' }, { status: 500 });
  }
}
