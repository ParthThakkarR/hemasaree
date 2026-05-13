'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  IndianRupee, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Clock,
  ChevronRight
} from 'lucide-react';
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
  Filler,
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
  Filler
);

interface Stats {
  totalProducts: number;
  lowStockCount: number;
  totalRevenue: number;
  totalOrders: number;
  inventoryValue: number;
  visitorCount: number;
  recentOrders: any[];
  topProducts: any[];
}

interface AIInsight {
  type: string;
  priority: string;
  title: string;
  description: string;
  action: string;
}

interface AIResponse {
  summary: string;
  insights: AIInsight[];
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [aiInsights, setAiInsights] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Parallel data fetching
      const [productsRes, salesRes, statsRes] = await Promise.all([
        fetch('/api/products?page=1&limit=100', { cache: 'no-store' }),
        fetch('/api/analytics/sales', { cache: 'no-store' }),
        fetch('/api/admin/stats', { cache: 'no-store' })
      ]);

      if (!productsRes.ok || !salesRes.ok || !statsRes.ok) throw new Error('Failed to fetch dashboard data');

      const productsData = await productsRes.json();
      const salesTrendData = await salesRes.json();
      const statsData = await statsRes.json();

      setProducts(productsData.products || []);
      setSalesData(salesTrendData);
      setStats(statsData);

      // Trigger AI insights after stats are loaded
      fetchAIInsights(statsData);
      
    } catch (err: any) {
      console.error(err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAIInsights = async (currentStats: Stats) => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/admin/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stats: currentStats })
      });
      if (res.ok) {
        const data = await res.json();
        setAiInsights(data);
      }
    } catch (err) {
      console.error('AI Insights error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAdmin) {
      fetchData();
    }
  }, [user, fetchData]);

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-800 rounded-full animate-spin" />
        <p className="text-ink-muted font-medium animate-pulse">Analyzing your store data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-red-100">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-serif font-bold text-ink mb-2">Something went wrong</h2>
        <p className="text-ink-muted mb-6">{error}</p>
        <button onClick={fetchData} className="premium-btn w-full py-3">Try Again</button>
      </div>
    </div>
  );

  // === Category Distribution ===
  const categoryCounts = products.reduce<Record<string, number>>((acc, p) => {
    const cat = p.category?.name || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categoryDonut = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: ['#6B0F1A', '#92140C', '#E4B363', '#3D1A24', '#BE95C4'],
        borderWidth: 0,
        hoverOffset: 15
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-serif font-bold text-ink mb-1">Business Overview</h1>
            <p className="text-ink-muted flex items-center gap-2">
              <Clock size={14} /> Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-brand-200 rounded-xl text-ink font-semibold hover:bg-brand-50 transition-colors shadow-sm"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <Link 
              href="/admin/product"
              className="flex items-center gap-2 px-5 py-2 bg-brand-800 text-white rounded-xl font-semibold hover:bg-brand-900 transition-all shadow-md hover:shadow-lg"
            >
              <ShoppingBag size={18} />
              Add Product
            </Link>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <KPICard 
            title="Total Revenue" 
            value={`₹${stats?.totalRevenue.toLocaleString()}`} 
            icon={<IndianRupee className="text-green-600" />} 
            trend="+12.5%" 
            trendUp={true}
          />
          <KPICard 
            title="Total Orders" 
            value={stats?.totalOrders.toString() || '0'} 
            icon={<ShoppingBag className="text-brand-600" />} 
            trend="+8.2%" 
            trendUp={true}
          />
          <KPICard 
            title="Active Visitors" 
            value={stats?.visitorCount.toString() || '0'} 
            icon={<Users className="text-blue-600" />} 
            trend="+24%" 
            trendUp={true}
            subtitle="Past 7 days"
          />
          <KPICard 
            title="Inventory Value" 
            value={`₹${(stats?.inventoryValue || 0).toLocaleString()}`} 
            icon={<TrendingUp className="text-purple-600" />} 
            subtitle={`${stats?.totalProducts} products`}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          
          {/* Main Sales Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-brand-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-serif font-bold text-ink">Sales Performance</h2>
              <select className="bg-brand-50 border-none rounded-lg text-sm font-semibold text-brand-800 px-3 py-1.5 focus:ring-0">
                <option>Last 30 Days</option>
                <option>Last 7 Days</option>
              </select>
            </div>
            <div className="h-[350px]">
              {salesData && (
                <Line
                  data={{
                    labels: salesData.labels.map((l: string) => l.split('-').slice(1).join('/')),
                    datasets: [
                      {
                        label: "Revenue (₹)",
                        data: salesData.revenueData,
                        borderColor: "#6B0F1A",
                        backgroundColor: (context) => {
                          const ctx = context.chart.ctx;
                          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                          gradient.addColorStop(0, 'rgba(107, 15, 26, 0.2)');
                          gradient.addColorStop(1, 'rgba(107, 15, 26, 0)');
                          return gradient;
                        },
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 0,
                        pointHoverRadius: 6,
                        pointHoverBackgroundColor: '#6B0F1A',
                        pointHoverBorderColor: '#fff',
                        pointHoverBorderWidth: 2,
                      }
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: { mode: "index", intersect: false },
                    plugins: { 
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1c1917',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        cornerRadius: 12,
                        displayColors: false
                      }
                    },
                    scales: {
                      y: { 
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.03)' },
                        ticks: { font: { weight: 500 } }
                      },
                      x: { 
                        grid: { display: false },
                        ticks: { font: { weight: 500 }, maxTicksLimit: 10 }
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* AI Insights Panel */}
          <div className="bg-gradient-to-br from-[#3D1A24] to-[#1A0A12] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl group-hover:bg-accent/30 transition-all duration-1000" />
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                   <Sparkles className="text-accent animate-pulse" size={20} />
                </div>
                <div>
                   <h2 className="text-xl font-serif font-bold leading-none">Smart AI Insights</h2>
                   <span className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Powered by Gemini</span>
                </div>
              </div>

              {aiLoading ? (
                 <div className="flex-grow flex flex-col items-center justify-center gap-4 py-10">
                    <div className="flex gap-1">
                       <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
                       <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
                       <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                    </div>
                    <p className="text-sm text-white/60 font-medium">Crunching data for suggestions...</p>
                 </div>
              ) : (
                <div className="space-y-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                   {aiInsights?.insights.map((insight, idx) => (
                      <div key={idx} className="bg-white/5 hover:bg-white/10 transition-colors p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                         <div className="flex items-start justify-between mb-2">
                            <h3 className="text-sm font-bold text-accent">{insight.title}</h3>
                            <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded ${
                               insight.priority === 'high' ? 'bg-red-500/20 text-red-300' : 'bg-blue-500/20 text-blue-300'
                            }`}>
                               {insight.priority}
                            </span>
                         </div>
                         <p className="text-xs text-white/70 leading-relaxed mb-3">
                            {insight.description}
                         </p>
                         <button className="text-[11px] font-bold flex items-center gap-1 hover:text-accent transition-colors">
                            {insight.action} <ArrowRight size={12} />
                         </button>
                      </div>
                   ))}
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-white/10">
                 <p className="text-sm italic text-white/50 leading-relaxed">
                    &quot;{aiInsights?.summary || 'Analyzing your sales trends to give you the best advice.'}&quot;
                 </p>
              </div>
            </div>
          </div>

        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
           
           {/* Top Products */}
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-serif font-bold text-ink">Bestsellers</h2>
                 <Link href="/admin/product" className="text-sm font-semibold text-brand-800 hover:underline">View All</Link>
              </div>
              <div className="space-y-4">
                 {stats?.topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-50 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center font-serif font-bold text-brand-800">
                             {i + 1}
                          </div>
                          <div>
                             <p className="font-bold text-ink text-sm line-clamp-1">{p.name}</p>
                             <p className="text-xs text-ink-muted">{p.count} units sold</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-bold text-brand-800 text-sm">₹{(p.count * 15000).toLocaleString()}</p>
                          <p className="text-[10px] text-green-600 font-bold uppercase tracking-tighter">Est. Revenue</p>
                       </div>
                    </div>
                 ))}
                 {!stats?.topProducts.length && <p className="text-center py-10 text-ink-muted italic">No sales data yet.</p>}
              </div>
           </div>

           {/* Recent Orders */}
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-serif font-bold text-ink">Recent Orders</h2>
                 <Link href="/admin/order" className="text-sm font-semibold text-brand-800 hover:underline">Manage All</Link>
              </div>
              <div className="space-y-4">
                 {stats?.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border-b border-brand-50 last:border-0">
                       <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-brand-500'}`} />
                          <div>
                             <p className="font-bold text-ink text-sm">{order.user?.firstName || 'Guest'}</p>
                             <p className="text-xs text-ink-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-bold text-ink text-sm">₹{order.totalAmount.toLocaleString()}</p>
                          <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded uppercase tracking-tighter">
                             {order.status}
                          </span>
                       </div>
                    </div>
                 ))}
                 {!stats?.recentOrders.length && <p className="text-center py-10 text-ink-muted italic">No orders found.</p>}
              </div>
           </div>

        </div>

        {/* Product Inventory Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">
          <div className="p-6 border-b border-brand-100 flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-ink">Inventory Status</h2>
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 bg-red-500 rounded-full" />
               <span className="text-xs font-bold text-ink-muted uppercase">Low Stock Alert</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-brand-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-ink-muted font-bold uppercase tracking-wider text-[10px]">Product Name</th>
                  <th className="px-6 py-4 text-left text-ink-muted font-bold uppercase tracking-wider text-[10px]">Category</th>
                  <th className="px-6 py-4 text-left text-ink-muted font-bold uppercase tracking-wider text-[10px]">Price</th>
                  <th className="px-6 py-4 text-left text-ink-muted font-bold uppercase tracking-wider text-[10px]">Stock</th>
                  <th className="px-6 py-4 text-right text-ink-muted font-bold uppercase tracking-wider text-[10px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-ink">{p.name}</td>
                    <td className="px-6 py-4 text-ink-muted">{p.category?.name || '—'}</td>
                    <td className="px-6 py-4 font-semibold">₹{p.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                         <div className="w-16 h-1.5 bg-brand-100 rounded-full overflow-hidden">
                            <div 
                               className={`h-full rounded-full ${p.stock < 5 ? 'bg-red-500' : 'bg-green-500'}`} 
                               style={{ width: `${Math.min((p.stock / 20) * 100, 100)}%` }}
                            />
                         </div>
                         <span className={`font-bold ${p.stock < 5 ? 'text-red-600' : 'text-ink'}`}>{p.stock}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <Link href={`/admin/product`} className="text-brand-800 hover:text-brand-900 font-bold flex items-center justify-end gap-1">
                          Edit <ChevronRight size={14} />
                       </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function KPICard({ title, value, icon, trend, trendUp, subtitle }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        {trend && (
           <span className={`text-xs font-bold px-2 py-1 rounded-lg ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {trend}
           </span>
        )}
      </div>
      <p className="text-ink-muted text-sm font-medium mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-ink tracking-tight">{value}</h3>
      {subtitle && <p className="text-[10px] text-ink-faint mt-1 font-bold uppercase">{subtitle}</p>}
    </div>
  );
}

