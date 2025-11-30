import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Phone, Mail } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [usePhone, setUsePhone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          phone: usePhone ? phone : undefined,
          options: {
            data: {
              display_name: displayName || 'User',
              phone: usePhone ? phone : undefined,
            },
          },
        });
        if (error) throw error;
        setSuccess('Account created! Please wait for admin approval.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2" style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          }}>
            NextMeal
          </h1>
          <p className="text-white text-lg opacity-90">Hostel Meal Management</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8" style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
          border: '1px solid rgba(255,255,255,0.8)',
        }}>
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                isLogin
                  ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600'
              }`}
              style={isLogin ? {
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4), inset 0 -2px 4px rgba(0,0,0,0.2)',
              } : {
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <LogIn className="inline mr-2" size={18} />
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                !isLogin
                  ? 'bg-gradient-to-b from-indigo-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600'
              }`}
              style={!isLogin ? {
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4), inset 0 -2px 4px rgba(0,0,0,0.2)',
              } : {
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              <UserPlus className="inline mr-2" size={18} />
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border-2 border-green-200 rounded-xl text-green-700 text-sm"
              style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  placeholder="Enter your name"
                />
              </div>
            )}

            {!isLogin && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUsePhone(false)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                    !usePhone ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                  }`}
                  style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
                >
                  <Mail className="inline mr-1" size={16} />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setUsePhone(true)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                    usePhone ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                  }`}
                  style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
                >
                  <Phone className="inline mr-1" size={16} />
                  Phone
                </button>
              </div>
            )}

            {(!usePhone || isLogin) && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
                  style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                    background: 'linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%)',
                  }}
                  placeholder="your@email.com"
                />
              </div>
            )}

            {usePhone && !isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required={usePhone}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
                  style={{
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                    background: 'linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%)',
                  }}
                  placeholder="+880..."
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
                style={{
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(to bottom, #ffffff 0%, #f9fafb 100%)',
                }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              {loading ? 'Please wait...' : isLogin ? 'Login' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
