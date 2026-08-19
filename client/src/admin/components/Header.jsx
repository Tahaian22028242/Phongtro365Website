import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AdminContext } from './AdminContext';
import axios from 'axios';

function Header() {
  const { admin, setAdmin } = useContext(AdminContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const location = useLocation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  async function logout() {
    try {
      await axios.post('/admin-api/logout');
    } catch (e) {
      console.error(e);
    }
    setAdmin(null);
    setMenuOpen(false);
    window.location.href = '/admin';
  }

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to="/admin/users" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-rose-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <div>
              <div className="font-display font-black text-base text-slate-900 leading-tight">
                Phongtro<span className="text-rose-600">365</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Admin Portal</span>
            </div>
          </Link>

          {/* Main Nav Links (Desktop) */}
          {admin && (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/admin/users"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive('/admin/users')
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Quản lý Người dùng
              </Link>
              <Link
                to="/admin/reports"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive('/admin/reports')
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Báo cáo & Vi phạm
              </Link>
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive('/admin')
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Tạo Admin mới
              </Link>
            </nav>
          )}
        </div>

        {/* Right Section: View Main Site & User Menu */}
        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span>Xem trang web chính</span>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </Link>

          <div ref={menuRef} className="relative">
            {!admin ? (
              <Link
                to="/admin"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                Đăng nhập Admin
              </Link>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
                >
                  <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
                    {admin.name || admin.email}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {admin.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-fade-in">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs text-slate-400">Đang đăng nhập với vai trò</p>
                      <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{admin.email}</p>
                    </div>
                    <div className="py-1 md:hidden">
                      <Link
                        to="/admin/users"
                        className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Quản lý Người dùng
                      </Link>
                      <Link
                        to="/admin/reports"
                        className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Báo cáo & Vi phạm
                      </Link>
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Tạo Admin mới
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
