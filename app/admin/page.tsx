'use client';

import React, { useEffect, useState } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler, // ✅ Add this
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler // ✅ Register this to fix fill warning
);

type Product = {
  id: string;
  name: string;
  color: string;
  ocassion: string;
  price: number;
  stock: number;
  category: { id: string; name: string };
};

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [salesData, setSalesData] = useState<{ labels: string[]; revenueData: number[]; orderData: number[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
useEffect(() => {
  async function loadSales() {
    try {
      const res = await fetch("/api/analytics/sales");
      if (res.ok) {
        const data = await res.json();
        setSalesData(data);
      }
    } catch (err) {
      console.error("Failed to fetch sales data", err);
    }
  }
  loadSales();
}, []);
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/products?page=1&limit=100');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading)
    return <p className="text-center mt-20 text-gray-500">Loading dashboard...</p>;
  if (error)
    return <p className="text-center mt-20 text-red-500 font-medium">{error}</p>;
  if (!products.length)
    return <p className="text-center mt-20 text-gray-500">No products found.</p>;

  // === KPI Calculations ===
  const totalProducts = products.length;
  const lowStock = products.filter((p) => p.stock < 5).length;
  const totalStock = products.reduce((a, b) => a + (b.stock || 0), 0);
  const totalValue = products.reduce((a, b) => a + (b.price * b.stock), 0);

  // === Category Distribution ===
  const categoryCounts = products.reduce<Record<string, number>>((acc, p) => {
    const cat = p.category?.name || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // === Charts Data ===
  const stockChart = {
    labels: products.map((p) => p.name),
    datasets: [
      {
        label: 'Stock',
        data: products.map((p) => p.stock),
        backgroundColor: '#7c3aed',
      },
    ],
  };

  const categoryDonut = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: ['#7c3aed', '#9333ea', '#a855f7', '#c084fc', '#ddd6fe'],
      },
    ],
  };

  const salesTrend = {
    labels: Array.from({ length: 14 }, (_, i) => `Day ${i + 1}`),
    datasets: [
      {
        label: 'Sales (mock)',
        data: Array.from({ length: 14 }, () => Math.floor(Math.random() * 900) + 200),
        borderColor: '#7c3aed',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex flex-col sm:flex-row justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm">Product & Stock Overview</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 sm:mt-0 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          Refresh
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total Products</p>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Total Stock</p>
          <p className="text-2xl font-bold">{totalStock}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Low Stock</p>
          <p className="text-2xl font-bold text-red-500">{lowStock}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <p className="text-gray-500 text-sm">Inventory Value</p>
          <p className="text-2xl font-bold">₹ {totalValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-semibold mb-2">Stock by Product</h2>
          <Bar data={stockChart} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="bg-white shadow rounded-lg p-4">
          <h2 className="font-semibold mb-2">Products by Category</h2>
          <Doughnut data={categoryDonut} />
        </div>
      </div>

    {/* Sales Trend */}
<div className="bg-white shadow rounded-lg p-4 mb-10">
  <h2 className="font-semibold mb-2">Sales Trend (Last 30 Days)</h2>
  {!salesData ? (
    <p className="text-gray-500 text-sm">Loading sales data...</p>
  ) : (
    <Line
      data={{
        labels: salesData.labels,
        datasets: [
          {
            label: "Revenue (₹)",
            data: salesData.revenueData,
            borderColor: "#7c3aed",
            backgroundColor: "rgba(124, 58, 237, 0.2)",
            fill: true,
            tension: 0.3,
          },
          {
            label: "Orders",
            data: salesData.orderData,
            borderColor: "#9333ea",
            backgroundColor: "rgba(147, 51, 234, 0.2)",
            fill: true,
            tension: 0.3,
          },
        ],
      }}
      options={{
        responsive: true,
        interaction: { mode: "index" as const, intersect: false },
        plugins: { legend: { position: "bottom" } },
        scales: {
          y: { beginAtZero: true },
          x: { ticks: { maxRotation: 45, minRotation: 45 } },
        },
      }}
    />
  )}
</div>


      {/* Product Table */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="font-semibold mb-3">Product Overview</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Color</th>
                <th className="p-2 text-left">Occasion</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.category?.name || '—'}</td>
                  <td className="p-2">{p.color || '—'}</td>
                  <td className="p-2">{p.ocassion || '—'}</td>
                  <td className="p-2">₹ {p.price.toLocaleString()}</td>
                  <td className={`p-2 ${p.stock < 5 ? 'text-red-600 font-semibold' : ''}`}>{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="mt-10 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Saree Bazaar Admin Dashboard — powered by Prisma & Next.js
      </footer>
    </div>
  );
}
