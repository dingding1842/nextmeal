import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Check, X, User, Phone, Home, DollarSign } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function Waitlist() {
  const { profile } = useAuth();
  const [waitlist, setWaitlist] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [balance, setBalance] = useState('');

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_approved', false)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setWaitlist(data);
    }
    setLoading(false);
  };

  const handleApprove = async (userId: string) => {
    if (!roomNumber || !balance) {
      alert('Please set room number and balance first');
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        is_approved: true,
        room_number: roomNumber,
        balance: parseFloat(balance),
      })
      .eq('id', userId);

    if (!error) {
      setEditingUser(null);
      setRoomNumber('');
      setBalance('');
      fetchWaitlist();
    }
  };

  const handleReject = async (userId: string) => {
    if (!confirm('Are you sure you want to reject this user? This will delete their account.')) {
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (!error) {
      fetchWaitlist();
    }
  };

  const startEditing = (user: Profile) => {
    setEditingUser(user.id);
    setRoomNumber(user.room_number || '');
    setBalance(user.balance.toString());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-gray-600">Loading waitlist...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6" style={{
      boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
      border: '2px solid rgba(255,255,255,0.8)',
    }}>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Approval Waitlist</h2>

      {waitlist.length === 0 ? (
        <div className="text-center py-12">
          <User size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-500">No pending approvals</p>
        </div>
      ) : (
        <div className="space-y-4">
          {waitlist.map((user) => (
            <div
              key={user.id}
              className="p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl border-2 border-gray-200"
              style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xl"
                      style={{ boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}>
                      {user.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{user.display_name}</h3>
                      <p className="text-sm text-gray-500">
                        Registered: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Phone size={16} />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}

                  {editingUser === user.id && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                          <Home size={16} />
                          Room Number
                        </label>
                        <input
                          type="text"
                          value={roomNumber}
                          onChange={(e) => setRoomNumber(e.target.value)}
                          placeholder="e.g., 101"
                          className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
                          style={{
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                          }}
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1">
                          <DollarSign size={16} />
                          Initial Balance
                        </label>
                        <input
                          type="number"
                          value={balance}
                          onChange={(e) => setBalance(e.target.value)}
                          placeholder="e.g., 1000"
                          className="w-full px-3 py-2 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
                          style={{
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {editingUser === user.id ? (
                    <>
                      <button
                        onClick={() => handleApprove(user.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700"
                        style={{
                          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4), inset 0 -2px 4px rgba(0,0,0,0.2)',
                        }}
                      >
                        <Check size={18} />
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setEditingUser(null);
                          setRoomNumber('');
                          setBalance('');
                        }}
                        className="px-4 py-2 bg-gradient-to-b from-gray-300 to-gray-400 text-gray-700 rounded-xl font-semibold"
                        style={{
                          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(user)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-green-500 to-green-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-green-700"
                        style={{
                          boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4), inset 0 -2px 4px rgba(0,0,0,0.2)',
                        }}
                      >
                        <Check size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700"
                        style={{
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4), inset 0 -2px 4px rgba(0,0,0,0.2)',
                        }}
                      >
                        <X size={18} />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
