import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Layout from './components/Layout';
import MealCalendar from './components/tenant/MealCalendar';
import Account from './components/shared/Account';
import Orders from './components/shared/Orders';
import Statistics from './components/shared/Statistics';
import Waitlist from './components/admin/Waitlist';
import Members from './components/admin/Members';

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('');

  useEffect(() => {
    if (profile) {
      switch (profile.role) {
        case 'tenant':
          setActiveTab('meals');
          break;
        case 'accountant':
        case 'chef':
          setActiveTab('orders');
          break;
        case 'admin':
          setActiveTab('statistics');
          break;
      }
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Auth />;
  }

  if (!profile.is_approved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center" style={{
          boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
          border: '2px solid rgba(255,255,255,0.8)',
        }}>
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ boxShadow: '0 8px 24px rgba(251, 146, 60, 0.4)' }}>
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Pending Approval</h2>
          <p className="text-gray-600 mb-6">
            Your account is waiting for admin approval. Please check back later or contact the administrator.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 px-6 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:from-indigo-600 hover:to-indigo-700"
            style={{
              boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4), inset 0 -2px 4px rgba(0,0,0,0.2)',
            }}
          >
            Refresh Status
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'meals':
        return <MealCalendar />;
      case 'account':
        return <Account />;
      case 'orders':
        return <Orders />;
      case 'statistics':
        return <Statistics />;
      case 'waitlist':
        return <Waitlist />;
      case 'members':
        return <Members />;
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
