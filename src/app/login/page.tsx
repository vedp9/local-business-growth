'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth/auth.module.css';
import { mockDb } from '@/lib/mockDb';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const runFallback = () => {
    const result = mockDb.login(email, password);
    if (result.success) {
      router.push('/dashboard');
      router.refresh();
    } else {
      setError(result.error || 'Invalid credentials.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    if (mockDb.isStaticMode()) {
      runFallback();
      return;
    }

    try {
      const res = await fetch('/local-business-growth/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 404) {
        runFallback();
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError((data && data.error) || 'Invalid credentials.');
        setLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err) {
      runFallback();
    }
  };

  const handleDemoLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    mockDb.setSessionCookie('admin@store.com', 'Corner Grocery Store');
    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Local Vendor SaaS</h1>
          <p className={styles.subtitle}>Log in to manage your shop sales</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          {error && <div className={styles.errorAlert}>{error}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email Address</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              placeholder="name@store.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>

          <button 
            type="button" 
            onClick={handleDemoLogin} 
            className={styles.demoButton}
            disabled={loading}
          >
            Sign In as Guest (Demo)
          </button>
        </form>

        <p className={styles.footerText}>
          Don't have an account?{' '}
          <Link href="/register" className={styles.link}>
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}

