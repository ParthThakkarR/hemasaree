'use client';

import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js';
import Link from 'next/link';
import { Package, Tag, ClipboardList, RefreshCw, AlertTriangle, TrendingUp, BarChart3, IndianRupee } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

type Product = {
  id: string; name: string; color: string; ocassion: string;
  price: number; stock: number; category: { id: string; name: string };
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [salesData, setSalesData] = useState<{ labels: string[]; revenueData: number[]; orderData: number[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAll() {
      try {
        const [prodRes, salesRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/analytics/sales'),
        ]);
        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(Array.isArray(data) ? data : data.products || []);
        }
        if (salesRes.ok) {
          setSalesData(await salesRes.json());
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock < 5).length;
  const totalStock = products.reduce((a, b) => a + (b.stock || 0), 0);
  const totalValue = products.reduce((a, b) => a + (b.price * b.stock), 0);

  const categoryCounts = products.reduce<Record<string, number>>((acc, p) => {
    const cat = p.category?.name || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const brandColors = ['#e76f51', '#d85a40', '#f4a261', '#e9c46a', '#2a9d8f', '#264653'];

  const stockChart = {
    labels: products.slice(0, 20).map((p) => p.name.length > 15 ? p.name.slice(0, 15) + '\u2026' : p.name),
    datasets: [{
      label: 'Stock',
      data: products.slice(0, 20).map((p) => p.stock),
      backgroundColor: '#e76f51',
      borderRadius: 6,
    }],
  };

  const categoryDonut = {
    labels: Object.keys(categoryCounts),
    datasets: [{
      data: Object.values(categoryCounts),
      backgroundColor: brandColors,
      borderWidth: 0,
    }],
  };

  return (
    <>
      <style jsx>{`
        .admin-header { background: linear-gradient(135deg, #1e293b, #334155); color: white; border-radius: 16px; padding: 1.5rem 2rem; margin-bottom: 1.5rem; }
        .kpi-card { background: #fff; border-radius: 14px; padding: 1.25rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; transition: transform 0.2s; }
        .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
        .kpi-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .kpi-value { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
        .kpi-label { font-size: 0.82rem; color: #94a3b8; font-weight: 500; }
        .chart-card { background: #fff; border-radius: 14px; padding: 1.25rem; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #f1f5f9; }
        .chart-title { font-weight: 600; font-size: 1rem; margin-bottom: 0.75rem; color: #1e293b; }
        .quick-link { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 10px; text-decoration: none; color: #334155; font-weight: 500; transition: all 0.2s; border: 1px solid #e2e8f0; }
        .quick-link:hover { background: #fdf6f0; border-color: #e76f51; color: #e76f51; }
        .stock-low { color: #dc2626; font-weight: 700; }
      `}</style>

      <div className="container-fluid py-4 px-md-4">
        <div className="admin-header d-flex flex-wrap justify-content-between align-items-center">
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Admin Dashboard</h1>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.88rem' }}>Hema Sarees - Product & Sales Overview</p>
          </div>
          <button className="btn btn-light btn-sm d-flex align-items-center gap-2" style={{ borderRadius: 10 }} onClick={() => window.location.reload()}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {loading && <div className="text-center py-5"><div className="spinner-border" style={{ color: '#e76f51' }} /></div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && !error && (
          <>
            {/* KPI Cards */}
            <div className="row g-3 mb-4">
              <div className="col-6 col-lg-3">
                <div className="kpi-card">
                  <div className="d-flex align-items-center gap-3">
                    <div className="kpi-icon" style={{ background: '#fdf6f0', color: '#e76f51' }}><Package size={22} /></div>
                    <div><div className="kpi-value">{totalProducts}</div><div className="kpi-label">Total Products</div></div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="kpi-card">
                  <div className="d-flex align-items-center gap-3">
                    <div className="kpi-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><BarChart3 size={22} /></div>
                    <div><div className="kpi-value">{totalStock}</div><div className="kpi-label">Total Stock</div></div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="kpi-card">
                  <div className="d-flex align-items-center gap-3">
                    <div className="kpi-icon" style={{ background: '#fef2f2', color: '#dc2626' }}><AlertTriangle size={22} /></div>
                    <div><div className="kpi-value stock-low">{lowStock}</div><div className="kpi-label">Low Stock Items</div></div>
                  </div>
                </div>
              </div>
              <div className="col-6 col-lg-3">
                <div className="kpi-card">
                  <div className="d-flex align-items-center gap-3">
                    <div className="kpi-icon" style={{ background: '#eff6ff', color: '#2563eb' }}><IndianRupee size={22} /></div>
                    <div><div className="kpi-value">{'\u20B9'}{totalValue.toLocaleString()}</div><div className="kpi-label">Inventory Value</div></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="row g-3 mb-4">
              <div className="col-md-4"><Link href="/admin/product" className="quick-link"><Package size={18} /> Manage Products</Link></div>
              <div className="col-md-4"><Link href="/admin/categories" className="quick-link"><Tag size={18} /> Manage Categories</Link></div>
              <div className="col-md-4"><Link href="/admin/order" className="quick-link"><ClipboardList size={18} /> Manage Orders</Link></div>
            </div>

            {/* Charts Row */}
            <div className="row g-3 mb-4">
              <div className="col-md-8">
                <div className="chart-card">
                  <div className="chart-title">Stock by Product</div>
                  <Bar data={stockChart} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true }, x: { ticks: { maxRotation: 45, minRotation: 45 } } } }} />
                </div>
              </div>
              <div className="col-md-4">
                <div className="chart-card">
                  <div className="chart-title">Products by Category</div>
                  <Doughnut data={categoryDonut} options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10 } } } }} />
                </div>
              </div>
            </div>

            {/* Sales Trend */}
            {salesData && (
              <div className="chart-card mb-4">
                <div className="chart-title d-flex align-items-center gap-2"><TrendingUp size={18} /> Sales Trend (Last 30 Days)</div>
                <Line
                  data={{
                    labels: salesData.labels,
                    datasets: [
                      { label: 'Revenue (\u20B9)', data: salesData.revenueData, borderColor: '#e76f51', backgroundColor: 'rgba(231,111,81,0.1)', fill: true, tension: 0.3 },
                      { label: 'Orders', data: salesData.orderData, borderColor: '#2a9d8f', backgroundColor: 'rgba(42,157,143,0.1)', fill: true, tension: 0.3 },
                    ],
                  }}
                  options={{ responsive: true, interaction: { mode: 'index' as const, intersect: false }, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true }, x: { ticks: { maxRotation: 45, minRotation: 45 } } } }}
                />
              </div>
            )}

            {/* Product Table */}
            <div className="chart-card">
              <div className="chart-title">Product Overview</div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th><th>Category</th><th>Color</th><th>Occasion</th><th>Price</th><th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td className="fw-medium">{p.name}</td>
                        <td>{p.category?.name || '\u2014'}</td>
                        <td>{p.color || '\u2014'}</td>
                        <td>{p.ocassion || '\u2014'}</td>
                        <td>{'\u20B9'}{p.price.toLocaleString()}</td>
                        <td className={p.stock < 5 ? 'stock-low' : ''}>{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
