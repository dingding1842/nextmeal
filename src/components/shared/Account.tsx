import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { User, Phone, Mail, DollarSign, Home, Shield } from 'lucide-react';

export default function Account() {
  const { profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setLoading(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        phone: phone || null,
      })
      .eq('id', profile.id);

    if (error) {
      setMessage('Error updating profile: ' + error.message);
    } else {
      setMessage('Profile updated successfully!');
      await refreshProfile();
    }

    setLoading(false);
  };

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8" style={{
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
        border: '2px solid rgba(255,255,255,0.8)',
      }}>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">My Account</h2>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border-2 border-indigo-200" style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <Shield className="text-indigo-600" size={24} />
            <div>
              <div className="text-sm text-gray-600">Role</div>
              <div className="font-bold text-lg capitalize text-indigo-600">{profile.role}</div>
            </div>
          </div>

          {profile.role === 'tenant' && (
            <>
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border-2 border-green-200" style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              }}>
                <DollarSign className="text-green-600" size={24} />
                <div>
                  <div className="text-sm text-gray-600">Balance</div>
                  <div className="font-bold text-2xl text-green-600">৳{profile.balance}</div>
                </div>
              </div>

              {profile.room_number && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border-2 border-blue-200" style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                }}>
                  <Home className="text-blue-600" size={24} />
                  <div>
                    <div className="text-sm text-gray-600">Room Number</div>
                    <div className="font-bold text-lg text-blue-600">{profile.room_number}</div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
            profile.is_approved
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`} style={{
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
          }}>
            <div className={`w-3 h-3 rounded-full ${
              profile.is_approved ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
            <div>
              <div className="text-sm text-gray-600">Status</div>
              <div className={`font-bold ${
                profile.is_approved ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {profile.is_approved ? 'Approved' : 'Pending Approval'}
              </div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${
            message.includes('Error')
              ? 'bg-red-50 border-2 border-red-200 text-red-700'
              : 'bg-green-50 border-2 border-green-200 text-green-700'
          }`} style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <User size={18} />
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
              style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                background: 'linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%)',
              }}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Phone size={18} />
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
              style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                background: 'linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%)',
              }}
              placeholder="+880..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Mail size={18} />
              Email
            </label>
            <input
              type="email"
              value={profile.id}
              disabled
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-gray-100 text-gray-600"
              style={{
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              }}
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
