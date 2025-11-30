import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Calendar, User, BarChart3, Users, Clock } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const { profile, signOut } = useAuth();

  if (!profile) return null;

  const getTabs = () => {
    switch (profile.role) {
      case 'tenant':
        return [
          { id: 'meals', label: 'Meals', icon: Calendar },
          { id: 'account', label: 'Account', icon: User },
        ];
      case 'accountant':
        return [
          { id: 'orders', label: 'Orders', icon: Clock },
          { id: 'statistics', label: 'Statistics', icon: BarChart3 },
          { id: 'waitlist', label: 'Waitlist', icon: Users },
          { id: 'account', label: 'Account', icon: User },
        ];
      case 'chef':
        return [
          { id: 'orders', label: 'Orders', icon: Clock },
          { id: 'statistics', label: 'Statistics', icon: BarChart3 },
          { id: 'account', label: 'Account', icon: User },
        ];
      case 'admin':
        return [
          { id: 'statistics', label: 'Statistics', icon: BarChart3 },
          { id: 'waitlist', label: 'Waitlist', icon: Users },
          { id: 'members', label: 'Members', icon: Users },
          { id: 'account', label: 'Account', icon: User },
        ];
      default:
        return [];
    }
  };

  const tabs = getTabs();

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }}>
      <header className="bg-white shadow-lg border-b-4 border-indigo-200" style={{
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-indigo-600" style={{
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
              }}>
                NextMeal
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Welcome, <span className="font-semibold">{profile.display_name}</span>
                <span className="mx-2">•</span>
                <span className="capitalize text-indigo-600 font-semibold">{profile.role}</span>
              </p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-b from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all"
              style={{
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3), inset 0 -2px 4px rgba(0,0,0,0.2)',
              }}
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b-2 border-gray-200 overflow-x-auto" style={{
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all border-b-4 ${
                    isActive
                      ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                      : 'border-transparent text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                  }`}
                  style={isActive ? {
                    boxShadow: 'inset 0 -2px 4px rgba(99, 102, 241, 0.1)',
                  } : {}}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
