'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';
import { mockDb } from '@/lib/mockDb';

interface Sale {
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

interface DashboardClientProps {
  storeName: string;
  email: string;
}

export default function DashboardClient({ storeName, email }: DashboardClientProps) {
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [filter, setFilter] = useState<'today' | '7days' | '30days' | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form Fields
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unitPrice, setUnitPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Collapsible Customer Fields
  const [showCustomerFields, setShowCustomerFields] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch sales from API
  const fetchSales = useCallback(async () => {
    setLoading(true);

    const runFallback = () => {
      const mockSales = mockDb.getSales(filter);
      setSales(mockSales);
      setLoading(false);
    };

    if (mockDb.isStaticMode()) {
      runFallback();
      return;
    }

    try {
      const res = await fetch(`/local-business-growth/api/sales?filter=${filter}`);
      if (res.status === 404) {
        runFallback();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setSales(data.sales || []);
      }
    } catch (err) {
      runFallback();
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // Unique product names for autocomplete datalist
  const productNames = Array.from(new Set(sales.map((s) => s.productName)));

  // Logout handler
  const handleLogout = async () => {
    const runFallback = () => {
      mockDb.clearSessionCookie();
      router.push('/login');
      router.refresh();
    };

    if (mockDb.isStaticMode()) {
      runFallback();
      return;
    }

    try {
      const res = await fetch('/local-business-growth/api/auth/logout', { method: 'POST' });
      if (res.status === 404) {
        runFallback();
        return;
      }
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      runFallback();
    }
  };

  // Seed handler
  const handleSeed = async () => {
    setSeeding(true);

    const runFallback = async () => {
      mockDb.seedSales();
      setFilter('all');
      await fetchSales();
      setSeeding(false);
    };

    if (mockDb.isStaticMode()) {
      await runFallback();
      return;
    }

    try {
      const res = await fetch('/local-business-growth/api/sales/seed', { method: 'POST' });
      if (res.status === 404) {
        await runFallback();
        return;
      }
      if (res.ok) {
        setFilter('all');
        await fetchSales();
      }
    } catch (err) {
      await runFallback();
    } finally {
      setSeeding(false);
    }
  };

  // Add Sale handler
  const handleAddSale = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!productName || !quantity || !unitPrice) {
      setFormError('Product Name, Quantity, and Unit Price are required.');
      return;
    }

    const qty = parseInt(quantity, 10);
    const price = parseFloat(unitPrice);

    if (isNaN(qty) || qty <= 0) {
      setFormError('Quantity must be a positive number.');
      return;
    }

    if (isNaN(price) || price < 0) {
      setFormError('Unit price must be a non-negative number.');
      return;
    }

    setSubmitting(true);

    const runFallback = () => {
      mockDb.addSale({
        productName,
        quantity: qty,
        unitPrice: price,
        paymentMethod,
        saleDate: saleDate ? new Date(saleDate).toISOString() : new Date().toISOString(),
        customerName: customerName || null,
        customerPhone: customerPhone || null,
      });
      setFormSuccess('Sale recorded successfully!');
      setProductName('');
      setQuantity('1');
      setUnitPrice('');
      setCustomerName('');
      setCustomerPhone('');
      setShowCustomerFields(false);
      fetchSales();
      setSubmitting(false);
    };

    if (mockDb.isStaticMode()) {
      runFallback();
      return;
    }

    try {
      const res = await fetch('/local-business-growth/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          quantity: qty,
          unitPrice: price,
          paymentMethod,
          saleDate: saleDate ? new Date(saleDate).toISOString() : undefined,
          customerName: customerName || undefined,
          customerPhone: customerPhone || undefined,
        }),
      });

      if (res.status === 404) {
        runFallback();
        return;
      }

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setFormError((data && data.error) || 'Failed to record sale.');
      } else {
        setFormSuccess('Sale recorded successfully!');
        setProductName('');
        setQuantity('1');
        setUnitPrice('');
        setCustomerName('');
        setCustomerPhone('');
        setShowCustomerFields(false);
        fetchSales();
      }
    } catch (err) {
      runFallback();
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Sale handler
  const handleDeleteSale = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sale entry?')) return;

    const runFallback = () => {
      try {
        const salesStr = localStorage.getItem('local_sales');
        if (salesStr) {
          const salesList = JSON.parse(salesStr);
          const updated = salesList.filter((s: any) => s.id !== id);
          localStorage.setItem('local_sales', JSON.stringify(updated));
          fetchSales();
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (mockDb.isStaticMode()) {
      runFallback();
      return;
    }

    try {
      const res = await fetch(`/local-business-growth/api/sales?id=${id}`, { method: 'DELETE' });
      if (res.status === 404) {
        runFallback();
        return;
      }
      if (res.ok) {
        fetchSales();
      } else {
        alert('Failed to delete sale record.');
      }
    } catch (err) {
      runFallback();
    }
  };


  // KPI Calculations
  const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const totalOrders = sales.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Chart Data Processing: Last 7 Days Revenue
  const getDailyRevenueData = () => {
    const dailyMap: Record<string, number> = {};
    
    // Initialize last 7 days with 0
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      dailyMap[label] = 0;
    }

    sales.forEach((s) => {
      const label = new Date(s.saleDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (label in dailyMap) {
        dailyMap[label] += s.totalAmount;
      }
    });

    return Object.entries(dailyMap).map(([day, amount]) => ({ label: day, value: amount }));
  };

  // Chart Data Processing: Top 5 Products by Revenue
  const getTopProductsData = () => {
    const productMap: Record<string, number> = {};
    sales.forEach((s) => {
      productMap[s.productName] = (productMap[s.productName] || 0) + s.totalAmount;
    });

    return Object.entries(productMap)
      .map(([name, value]) => ({ label: name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  };

  const dailyData = getDailyRevenueData();
  const topProductsData = getTopProductsData();

  const maxDailyValue = Math.max(...dailyData.map((d) => d.value), 10);
  const maxProductValue = Math.max(...topProductsData.map((p) => p.value), 10);

  if (!mounted) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-app)', color: 'var(--text-secondary)' }}>
        <div style={{ fontWeight: 600 }}>Loading ledger dashboard...</div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div>
          <div className={styles.sidebarBrand}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <h2 className={styles.storeTitle}>{storeName}</h2>
              {email === 'admin@store.com' && (
                <div style={{ marginTop: '0.15rem' }}>
                  <span className={styles.guestBadge}>Guest / Testing Mode</span>
                </div>
              )}
            </div>
            <p className={styles.storeSubtitle}>{email}</p>
          </div>
          
          <nav className={styles.navLinks}>
            <button className={`${styles.navLink} ${styles.navLinkActive}`}>
              <span>📊</span> Dashboard
            </button>
          </nav>
        </div>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className={styles.main}>
        {/* Header Block */}
        <header className={styles.header}>
          <div className={styles.headerInfo}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1>Sales Dashboard</h1>
              {email === 'admin@store.com' && (
                <span className={styles.guestBadgeHeader}>Guest / Testing Mode</span>
              )}
            </div>
            <p>Welcome back to your shop ledger</p>
          </div>

          <div className={styles.controls}>
            {/* Quick Time Filters */}
            <div className={styles.filterGroup}>
              <button
                onClick={() => setFilter('today')}
                className={`${styles.filterBtn} ${filter === 'today' ? styles.todayFilterActive + ' ' + styles.filterBtnActive : ''}`}
              >
                Today
              </button>
              <button
                onClick={() => setFilter('7days')}
                className={`${styles.filterBtn} ${filter === '7days' ? styles.filterBtnActive : ''}`}
              >
                7 Days
              </button>
              <button
                onClick={() => setFilter('30days')}
                className={`${styles.filterBtn} ${filter === '30days' ? styles.filterBtnActive : ''}`}
              >
                30 Days
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
              >
                All Time
              </button>
            </div>

            <button onClick={handleSeed} className={styles.seedBtn} disabled={seeding}>
              {seeding ? '🌱 Seeding...' : '🌱 Seed Demo Data'}
            </button>
          </div>
        </header>

        {/* KPI Summary Row */}
        <section className={styles.kpiGrid}>
          <div className={`${styles.kpiCard} ${filter === 'today' ? styles.kpiCardTodayAccent : ''}`}>
            <span className={styles.kpiLabel}>Revenue</span>
            <div className={styles.kpiValue}>${totalRevenue.toFixed(2)}</div>
            <span className={styles.kpiSubtext}>
              {filter === 'today' ? "Today's gross sales" : `Total in selected range`}
            </span>
          </div>

          <div className={`${styles.kpiCard} ${filter === 'today' ? styles.kpiCardTodayAccent : ''}`}>
            <span className={styles.kpiLabel}>Orders</span>
            <div className={styles.kpiValue}>{totalOrders}</div>
            <span className={styles.kpiSubtext}>
              {filter === 'today' ? "Today's transactions count" : `Total sales volume`}
            </span>
          </div>

          <div className={`${styles.kpiCard} ${filter === 'today' ? styles.kpiCardTodayAccent : ''}`}>
            <span className={styles.kpiLabel}>Avg Order Value</span>
            <div className={styles.kpiValue}>${averageOrderValue.toFixed(2)}</div>
            <span className={styles.kpiSubtext}>Average receipt ticket</span>
          </div>
        </section>

        {/* Dashboard Panels Grid */}
        <section className={styles.grid}>
          {/* Left Column: Input Billing Form & SVG Analytics charts */}
          <div className={styles.panel}>
            {/* Sales Entry Card */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                Quick Record Sale
                <span className={styles.cardTitleBadge}>POS</span>
              </h2>

              <form onSubmit={handleAddSale} className={styles.form}>
                {formError && <div className={styles.errorAlert}>{formError}</div>}
                {formSuccess && <div className={styles.successAlert}>{formSuccess}</div>}

                {/* Autocomplete Product Input */}
                <div className={styles.formGroup}>
                  <label htmlFor="prodName" className={styles.label}>Product Name</label>
                  <input
                    id="prodName"
                    type="text"
                    list="products-list"
                    className={styles.input}
                    placeholder="e.g. Milk, Apples"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                  <datalist id="products-list">
                    {productNames.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>

                {/* Form fields in row for fast tabular entries */}
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label htmlFor="qty" className={styles.label}>Quantity</label>
                    <input
                      id="qty"
                      type="number"
                      min="1"
                      className={styles.input}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="price" className={styles.label}>Unit Price ($)</label>
                    <input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      className={styles.input}
                      placeholder="0.00"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="payMethod" className={styles.label}>Payment Method</label>
                    <select
                      id="payMethod"
                      className={styles.select}
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Date Selection */}
                <div className={styles.formGroup}>
                  <label htmlFor="date" className={styles.label}>Sale Date</label>
                  <input
                    id="date"
                    type="date"
                    className={styles.input}
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    required
                  />
                </div>

                {/* Collapsible Customer section to save space */}
                <button
                  type="button"
                  onClick={() => setShowCustomerFields(!showCustomerFields)}
                  className={styles.collapsibleTrigger}
                >
                  {showCustomerFields ? '▲ Hide Customer Info (Optional)' : '▼ Add Customer Info (Optional)'}
                </button>

                {showCustomerFields && (
                  <div className={styles.collapsibleContent}>
                    <div className={styles.formGroup}>
                      <label htmlFor="custName" className={styles.label}>Customer Name</label>
                      <input
                        id="custName"
                        type="text"
                        className={styles.input}
                        placeholder="e.g. John Doe"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="custPhone" className={styles.label}>Customer Phone</label>
                      <input
                        id="custPhone"
                        type="tel"
                        className={styles.input}
                        placeholder="e.g. +123456789"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? 'Recording...' : 'Record Transaction'}
                </button>
              </form>
            </div>

            {/* Custom SVG Charts panel */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Weekly Sales Trend ($)</h2>
              {sales.length === 0 ? (
                <div className={styles.emptyChart}>No sales recorded to display trend.</div>
              ) : (
                <div>
                  <div className={styles.chartWrapper}>
                    {dailyData.map((d, index) => {
                      const percentage = (d.value / maxDailyValue) * 100;
                      // Ensure a minimal height for visibility
                      const heightPercent = percentage > 0 ? Math.max(percentage, 5) : 0;
                      return (
                        <div key={index} className={styles.barCol}>
                          <div className={styles.barTooltip}>${d.value.toFixed(2)}</div>
                          <div
                            className={styles.bar}
                            style={{ height: `${heightPercent}%` }}
                          />
                          <span className={styles.barLabel}>{d.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className={styles.chartLegend}>
                    <span>📅 Last 7 Calendar Days</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sales History logs & Top products listing */}
          <div className={styles.panel}>
            {/* Top Products Grid list */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Top Selling Products ($)</h2>
              {topProductsData.length === 0 ? (
                <div className={styles.emptyChart}>No sales data available.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {topProductsData.map((item, index) => {
                    const widthPercent = (item.value / maxProductValue) * 100;
                    return (
                      <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600 }}>
                          <span>{item.label}</span>
                          <span>${item.value.toFixed(2)}</span>
                        </div>
                        <div style={{ height: '10px', width: '100%', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${widthPercent}%`,
                              background: 'linear-gradient(to right, var(--primary), #a855f7)',
                              borderRadius: 'inherit',
                              transition: 'width 0.5s ease-in-out'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sales History Log Table */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>
                {filter === 'today' ? "Today's Auditing Log" : 'Sales Log Ledger'}
              </h2>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading sales log...</div>
              ) : sales.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyStateTitle}>No Sales Logged</div>
                  <p className={styles.emptyStateText}>
                    {filter === 'today'
                      ? "You haven't recorded any transactions today. Select another filter or use the quick billing form to start."
                      : "Your sales history is empty. Try using the billing form to create transactions, or generate seed records."}
                  </p>
                  {sales.length === 0 && (
                    <button onClick={handleSeed} className={styles.seedBtn} style={{ margin: '0 auto' }} disabled={seeding}>
                      {seeding ? '🌱 Seeding...' : '🌱 Load Demo Sales'}
                    </button>
                  )}
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Customer</th>
                        <th style={{ width: '50px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => {
                        let badgeClass = styles.badgeCash;
                        if (sale.paymentMethod === 'UPI') badgeClass = styles.badgeUPI;
                        else if (sale.paymentMethod === 'Card') badgeClass = styles.badgeCard;
                        else if (sale.paymentMethod === 'Other') badgeClass = styles.badgeOther;

                        return (
                          <tr key={sale.id}>
                            <td>
                              {new Date(sale.saleDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td style={{ fontWeight: 600 }}>{sale.productName}</td>
                            <td>{sale.quantity}</td>
                            <td>${sale.unitPrice.toFixed(2)}</td>
                            <td style={{ fontWeight: 700 }}>${sale.totalAmount.toFixed(2)}</td>
                            <td>
                              <span className={`${styles.badge} ${badgeClass}`}>
                                {sale.paymentMethod}
                              </span>
                            </td>
                            <td>
                              {sale.customerName ? (
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{sale.customerName}</div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{sale.customerPhone}</div>
                                </div>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>-</span>
                              )}
                            </td>
                            <td>
                              <button
                                onClick={() => handleDeleteSale(sale.id)}
                                className={styles.deleteBtn}
                                aria-label="Delete sale"
                                title="Delete entry"
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
