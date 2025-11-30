import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronLeft, ChevronRight, Plus, X, AlertCircle } from 'lucide-react';
import { canOrderLunch, canOrderDinner, formatDate } from '../../utils/time';
import type { Database } from '../../lib/database.types';

type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

export default function MealCalendar() {
  const { profile, refreshProfile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<'lunch' | 'dinner' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
  }, [currentDate]);

  const fetchOrders = async () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', profile?.id)
      .gte('order_date', formatDate(startOfMonth))
      .lte('order_date', formatDate(endOfMonth));

    if (!error && data) {
      setOrders(data);
    }
  };

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true);

    if (!error && data) {
      setMenuItems(data);
    }
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

  const handleOrderMeal = async (menuItemId: string) => {
    if (!selectedDate || !selectedMealType || !profile) return;

    setLoading(true);
    setError(null);

    if (profile.balance < 100) {
      setError('Insufficient balance. Please contact the accountant to add funds.');
      setLoading(false);
      return;
    }

    const today = formatDate(new Date());
    if (selectedDate === today) {
      if (selectedMealType === 'lunch' && !canOrderLunch()) {
        setError('Lunch ordering closed for today (deadline: 10:00 AM GMT+6)');
        setLoading(false);
        return;
      }
      if (selectedMealType === 'dinner' && !canOrderDinner()) {
        setError('Dinner ordering closed for today (deadline: 4:00 PM GMT+6)');
        setLoading(false);
        return;
      }
    }

    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: profile.id,
        menu_item_id: menuItemId,
        order_date: selectedDate,
        meal_type: selectedMealType,
        quantity: 1,
        amount_paid: 100,
      });

    if (orderError) {
      setError(orderError.message);
    } else {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: profile.balance - 100 })
        .eq('id', profile.id);

      if (!updateError) {
        await refreshProfile();
        await fetchOrders();
        setSelectedDate(null);
        setSelectedMealType(null);
      }
    }

    setLoading(false);
  };

  const handleCancelOrder = async (orderId: string, amountPaid: number) => {
    if (!profile) return;

    setLoading(true);
    const { error: deleteError } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (!deleteError) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: profile.balance + amountPaid })
        .eq('id', profile.id);

      if (!updateError) {
        await refreshProfile();
        await fetchOrders();
      }
    }
    setLoading(false);
  };

  const days = getDaysInMonth();

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

      <div className="mb-4 p-4 bg-indigo-50 rounded-xl border-2 border-indigo-200" style={{
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700">Current Balance:</span>
          <span className="text-2xl font-bold text-indigo-600">৳{profile?.balance || 0}</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"
          style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

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

          const dateStr = formatDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
          const dayOrders = getOrdersForDate(day);
          const isToday = dateStr === formatDate(new Date());

          return (
            <div
              key={index}
              className={`min-h-24 p-2 rounded-xl border-2 ${
                isToday ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white'
              }`}
              style={{
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div className="font-semibold text-sm text-gray-700 mb-1">{day}</div>
              <div className="space-y-1">
                {dayOrders.map(order => (
                  <div
                    key={order.id}
                    className="text-xs p-1 bg-green-100 rounded border border-green-300 flex items-center justify-between"
                  >
                    <span className="font-medium capitalize">{order.meal_type}</span>
                    <button
                      onClick={() => handleCancelOrder(order.id, order.amount_paid)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {dayOrders.length < 2 && (
                  <button
                    onClick={() => setSelectedDate(dateStr)}
                    className="w-full text-xs p-1 bg-indigo-100 text-indigo-700 rounded border border-indigo-300 hover:bg-indigo-200 flex items-center justify-center gap-1"
                  >
                    <Plus size={14} />
                    <span>Add</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full" style={{
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}>
            <h3 className="text-xl font-bold mb-4">Order Meal for {selectedDate}</h3>

            {!selectedMealType ? (
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedMealType('lunch')}
                  className="w-full py-4 px-6 bg-gradient-to-b from-orange-400 to-orange-500 text-white font-bold rounded-xl"
                  style={{
                    boxShadow: '0 4px 12px rgba(251, 146, 60, 0.4), inset 0 -2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  Lunch
                </button>
                <button
                  onClick={() => setSelectedMealType('dinner')}
                  className="w-full py-4 px-6 bg-gradient-to-b from-blue-400 to-blue-500 text-white font-bold rounded-xl"
                  style={{
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4), inset 0 -2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  Dinner
                </button>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="w-full py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="font-semibold text-lg capitalize">{selectedMealType} Menu</h4>
                {menuItems
                  .filter(item => item.meal_type === selectedMealType)
                  .map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleOrderMeal(item.id)}
                      disabled={loading}
                      className="w-full py-3 px-4 bg-gradient-to-b from-green-400 to-green-500 text-white font-semibold rounded-xl hover:from-green-500 hover:to-green-600 disabled:opacity-50"
                      style={{
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4), inset 0 -2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      {item.name} - ৳100
                    </button>
                  ))}
                <button
                  onClick={() => {
                    setSelectedDate(null);
                    setSelectedMealType(null);
                    setError(null);
                  }}
                  className="w-full py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
