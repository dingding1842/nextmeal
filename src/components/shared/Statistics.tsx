import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { TrendingUp, DollarSign, Users, UtensilsCrossed } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Order = Database['public']['Tables']['orders']['Row'];

interface Statistics {
  totalOrders: number;
  totalRevenue: number;
  totalLunches: number;
  totalDinners: number;
  todayLunches: number;
  todayDinners: number;
  todayRevenue: number;
  monthlyRevenue: number;
}

export default function Statistics() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Statistics>({
    totalOrders: 0,
    totalRevenue: 0,
    totalLunches: 0,
    totalDinners: 0,
    todayLunches: 0,
    todayDinners: 0,
    todayRevenue: 0,
    monthlyRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);

    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    const monthStart = startOfMonth.toISOString().split('T')[0];

    const { data: allOrders } = await supabase
      .from('orders')
      .select('*');

    const { data: todayOrders } = await supabase
      .from('orders')
      .select('*')
      .eq('order_date', today);

    const { data: monthOrders } = await supabase
      .from('orders')
      .select('*')
      .gte('order_date', monthStart);

    if (allOrders && todayOrders && monthOrders) {
      setStats({
        totalOrders: allOrders.length,
        totalRevenue: allOrders.reduce((sum, order) => sum + order.amount_paid, 0),
        totalLunches: allOrders.filter(o => o.meal_type === 'lunch').length,
        totalDinners: allOrders.filter(o => o.meal_type === 'dinner').length,
        todayLunches: todayOrders.filter(o => o.meal_type === 'lunch').length,
        todayDinners: todayOrders.filter(o => o.meal_type === 'dinner').length,
        todayRevenue: todayOrders.reduce((sum, order) => sum + order.amount_paid, 0),
        monthlyRevenue: monthOrders.reduce((sum, order) => sum + order.amount_paid, 0),
      });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-gray-600">Loading statistics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-2xl p-6" style={{
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
        border: '2px solid rgba(255,255,255,0.8)',
      }}>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Statistics Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl text-white" style={{
            boxShadow: '0 8px 24px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}>
            <div className="flex items-center justify-between mb-2">
              <DollarSign size={32} />
              <TrendingUp size={24} />
            </div>
            <div className="text-3xl font-bold mb-1">৳{stats.totalRevenue}</div>
            <div className="text-green-100 text-sm">Total Revenue</div>
          </div>

          <div className="p-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl text-white" style={{
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}>
            <div className="flex items-center justify-between mb-2">
              <UtensilsCrossed size={32} />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalOrders}</div>
            <div className="text-blue-100 text-sm">Total Orders</div>
          </div>

          <div className="p-6 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl text-white" style={{
            boxShadow: '0 8px 24px rgba(251, 146, 60, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}>
            <div className="flex items-center justify-between mb-2">
              <UtensilsCrossed size={32} />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalLunches}</div>
            <div className="text-orange-100 text-sm">Total Lunches</div>
          </div>

          <div className="p-6 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl text-white" style={{
            boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
          }}>
            <div className="flex items-center justify-between mb-2">
              <UtensilsCrossed size={32} />
            </div>
            <div className="text-3xl font-bold mb-1">{stats.totalDinners}</div>
            <div className="text-purple-100 text-sm">Total Dinners</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-6" style={{
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
        border: '2px solid rgba(255,255,255,0.8)',
      }}>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">Today's Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl border-2 border-amber-300" style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <div className="text-2xl font-bold text-amber-800">{stats.todayLunches}</div>
            <div className="text-amber-700 text-sm font-semibold">Lunches Today</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-sky-100 to-sky-200 rounded-xl border-2 border-sky-300" style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <div className="text-2xl font-bold text-sky-800">{stats.todayDinners}</div>
            <div className="text-sky-700 text-sm font-semibold">Dinners Today</div>
          </div>

          <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl border-2 border-emerald-300" style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <div className="text-2xl font-bold text-emerald-800">৳{stats.todayRevenue}</div>
            <div className="text-emerald-700 text-sm font-semibold">Revenue Today</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl p-6" style={{
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
        border: '2px solid rgba(255,255,255,0.8)',
      }}>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">This Month</h3>
        <div className="p-6 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl border-2 border-teal-300" style={{
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
        }}>
          <div className="text-4xl font-bold text-teal-800 mb-2">৳{stats.monthlyRevenue}</div>
          <div className="text-teal-700 text-lg font-semibold">Monthly Revenue</div>
        </div>
      </div>
    </div>
  );
}
