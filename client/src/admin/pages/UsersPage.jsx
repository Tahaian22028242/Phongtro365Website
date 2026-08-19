import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    axios.get('/auth/')
      .then(response => {
        setUsers(response.data || []);
      })
      .catch(error => {
        console.error('Error fetching users:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const blacklistedUsers = users.filter(user => user.status === 'BLACKLISTED');
  const activeUsers = users.filter(user => user.status === 'ACTIVE' || user.status === 'HIDDEN');

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.phone && u.phone.includes(searchQuery));

    if (!matchesSearch) return false;

    if (filterTab === 'ACTIVE') return u.status === 'ACTIVE' || u.status === 'HIDDEN';
    if (filterTab === 'BLACKLISTED') return u.status === 'BLACKLISTED';
    return true;
  });

  const getAvatarUrl = (user) => {
    if (user?.avatar) {
      return user.avatar.startsWith('http') ? user.avatar : BASE_URL + user.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || 'User')}&background=0F172A&color=fff&bold=true`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Người dùng</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng cộng: <strong className="text-slate-800">{users.length}</strong> tài khoản ({activeUsers.length} hoạt động, {blacklistedUsers.length} bị chặn)
          </p>
        </div>

        {/* Search box */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Tìm theo tên, email, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white transition-colors"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-400 absolute left-3 top-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar">
        <button
          type="button"
          onClick={() => setFilterTab('ALL')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            filterTab === 'ALL' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('ACTIVE')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            filterTab === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đang hoạt động ({activeUsers.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab('BLACKLISTED')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            filterTab === 'BLACKLISTED' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Bị chặn ({blacklistedUsers.length})
        </button>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <div key={n} className="bg-white rounded-3xl p-5 border border-slate-200 animate-pulse space-y-4">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-200"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
          <p className="text-sm font-semibold text-slate-700">Không tìm thấy người dùng phù hợp</p>
          <p className="text-xs text-slate-400">Hãy thử tìm kiếm với từ khóa khác.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map(user => {
            const isBlacklisted = user.status === 'BLACKLISTED';
            return (
              <div
                key={user.id}
                className={`bg-white rounded-3xl p-5 border shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between ${
                  isBlacklisted ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/20' : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Top Row: Avatar & Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getAvatarUrl(user)}
                        alt={user.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                      />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{user.name || 'Người dùng'}</h3>
                        <p className="text-xs text-slate-400 truncate max-w-[160px]">{user.email}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isBlacklisted
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {isBlacklisted ? 'Bị chặn' : 'Hoạt động'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Số điện thoại:</span>
                      <span className="font-medium text-slate-800">{user.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Zalo:</span>
                      <span className="font-medium text-slate-800">{user.zalo || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Số lần vi phạm:</span>
                      <span className={`font-bold ${user.violationCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                        {user.violationCount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <a
                    href={`/profile/${user.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 hover:underline"
                  >
                    <span>Xem hồ sơ công khai</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UsersPage;
