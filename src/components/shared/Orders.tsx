import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, ChevronRight, UtensilsCrossed } from 'lucide-react';
import { formatDate } from '../../utils/time';
import type { Database } from '../../lib/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface OrderWithDetails extends Order {
  menu_items: MenuItem;
  profiles: Profile;
}

export default function Orders() {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [currentDate]);

  const fetchOrders = async () => {
    setLoading(true);
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        menu_items (*),
        profiles (*)
      `)
      .gte('order_date', formatDate(startOfMonth))
      .lte('order_date', formatDate(endOfMonth))
      .order('order_date', { ascending: true });

    if (!error && data) {
      setOrders(data as OrderWithDetails[]);
    }
    setLoading(false);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getOrdersForDate = (day: number) => {
    const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    return orders.filter(order => order.order_date === dateStr);
  };

  const getDailySummary = (day: number) => {
    const dayOrders = getOrdersForDate(day);
    const lunch = dayOrders.filter(o => o.meal_type === 'lunch');
    const dinner = dayOrders.filter(o => o.meal_type === 'dinner');
    return { lunch, dinner };
  };

  const days = getDaysInMonth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6" style={{
      boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
      border: '2px solid rgba(255,255,255,0.8)',
    }}>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          className="p-2 rounded-xl bg-gradient-to-b from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)' }}
        >
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        <button
          onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          className="p-2 rounded-xl bg-gradient-to-b from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)' }}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-bold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} />;
          }

          const { lunch, dinner } = getDailySummary(day);
          const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
          const isToday = dateStr === formatDate(new Date());

          return (
            <div
              key={index}
              className={`min-h-32 p-2 rounded-xl border-2 ${
                isToday ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white'
              }`}
              style={{
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div className="font-semibold text-sm text-gray-700 mb-2">{day}</div>

              <div className="space-y-2">
                {lunch.length > 0 && (
                  <div className="p-2 bg-orange-100 rounded-lg border border-orange-300">
                    <div className="text-xs font-bold text-orange-800 mb-1">
                      <UtensilsCrossed size={12} className="inline mr-1" />
                      Lunch ({lunch.length})
                    </div>
                    {profile?.role === 'chef' && (
                      <div className="text-xs space-y-1">
                        {lunch.map(order => (
                          <div key={order.id} className="text-orange-700">
                            Room {order.profiles.room_number || 'N/A'}: {order.menu_items.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {dinner.length > 0 && (
                  <div className="p-2 bg-blue-100 rounded-lg border border-blue-300">
                    <div className="text-xs font-bold text-blue-800 mb-1">
                      <UtensilsCrossed size={12} className="inline mr-1" />
                      Dinner ({dinner.length})
                    </div>
                    {profile?.role === 'chef' && (
                      <div className="text-xs space-y-1">
                        {dinner.map(order => (
                          <div key={order.id} className="text-blue-700">
                            Room {order.profiles.room_number || 'N/A'}: {order.menu_items.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
