import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Edit2, Save, X, Home, DollarSign } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function Members() {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    role: '',
    room_number: '',
    balance: '',
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setMembers(data);
    }
    setLoading(false);
  };

  const startEditing = (user: Profile) => {
    setEditingUser(user.id);
    setEditForm({
      role: user.role,
      room_number: user.room_number || '',
      balance: user.balance.toString(),
    });
  };

  const handleSave = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({
        role: editForm.role as 'admin' | 'accountant' | 'tenant' | 'chef',
        room_number: editForm.room_number || null,
        balance: parseFloat(editForm.balance),
      })
      .eq('id', userId);

    if (!error) {
      setEditingUser(null);
      fetchMembers();
    }
  };

  const cancelEditing = () => {
    setEditingUser(null);
    setEditForm({ role: '', room_number: '', balance: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-xl text-gray-600">Loading members...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-6" style={{
      boxShadow: '0 20px 60px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.6)',
      border: '2px solid rgba(255,255,255,0.8)',
    }}>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Members Management</h2>

      {members.length === 0 ? (
        <div className="text-center py-12">
          <Users size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-500">No approved members yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-bold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700">Role</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700">Room</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700">Balance</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700">Phone</th>
                <th className="text-left py-3 px-4 font-bold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold"
                        style={{ boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}>
                        {member.display_name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800">{member.display_name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {editingUser === member.id ? (
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="px-3 py-1 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
                        style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
                      >
                        <option value="tenant">Tenant</option>
                        <option value="chef">Chef</option>
                        <option value="accountant">Accountant</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        member.role === 'admin' ? 'bg-red-100 text-red-700' :
                        member.role === 'accountant' ? 'bg-blue-100 text-blue-700' :
                        member.role === 'chef' ? 'bg-purple-100 text-purple-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {member.role}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {editingUser === member.id ? (
                      <input
                        type="text"
                        value={editForm.room_number}
                        onChange={(e) => setEditForm({ ...editForm, room_number: e.target.value })}
                        className="w-20 px-3 py-1 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
                        style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
                        placeholder="Room"
                      />
                    ) : (
                      <span className="text-gray-700">{member.room_number || 'N/A'}</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {editingUser === member.id ? (
                      <input
                        type="number"
                        value={editForm.balance}
                        onChange={(e) => setEditForm({ ...editForm, balance: e.target.value })}
                        className="w-24 px-3 py-1 rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:outline-none"
                        style={{ boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)' }}
                      />
                    ) : (
                      <span className="font-semibold text-green-600">৳{member.balance}</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-gray-600 text-sm">{member.phone || 'N/A'}</span>
                  </td>
                  <td className="py-4 px-4">
                    {editingUser === member.id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSave(member.id)}
                          className="p-2 bg-gradient-to-b from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700"
                          style={{
                            boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3), inset 0 -1px 2px rgba(0,0,0,0.2)',
                          }}
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="p-2 bg-gradient-to-b from-gray-300 to-gray-400 text-gray-700 rounded-lg"
                          style={{
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditing(member)}
                        className="p-2 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700"
                        style={{
                          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3), inset 0 -1px 2px rgba(0,0,0,0.2)',
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
