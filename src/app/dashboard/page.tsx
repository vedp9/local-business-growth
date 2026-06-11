'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<{ storeName: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasSession = document.cookie.includes('session=');
    if (!hasSession) {
      router.push('/login');
      return;
    }

    const getSessionFromCookie = () => {
      try {
        const cookiesList = document.cookie.split('; ');
        const sessionCookie = cookiesList.find(row => row.startsWith('session='));
        if (sessionCookie) {
          const token = sessionCookie.split('=')[1];
          const payloadBase64 = token.split('.')[1];
          // Base64Url decode helper
          const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const decodedPayload = JSON.parse(jsonPayload);
          return {
            storeName: decodedPayload.storeName || 'My Store',
            email: decodedPayload.email || 'vendor@store.com'
          };
        }
      } catch (e) {
        console.error('Failed to parse session cookie client-side', e);
      }
      return { storeName: 'My Shop', email: 'vendor@shop.com' };
    };

    setSession(getSessionFromCookie());
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)' }}>
        <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Verifying credentials...</div>
      </div>
    );
  }

  if (!session) return null;

  return <DashboardClient storeName={session.storeName} email={session.email} />;
}
