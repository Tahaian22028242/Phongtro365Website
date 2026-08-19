import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from './UserContext';
import axios from 'axios';
import { BASE_URL } from '../../config';
import NotificationButton from './NotificationButton';
import AiRecommendationModal from './AiRecommendationModal';

function Header() {
  const { user, setUser } = useContext(UserContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
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

  // Close mobile nav on route change
  useEffect(() => {
    setMobileNavOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  async function logout() {
    try {
      await axios.post('/auth/logout');
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setMenuOpen(false);
    window.location.href = '/';
  }

  const getAvatarUrl = () => {
    if (user?.avatar) {
      return user.avatar.startsWith('http') ? user.avatar : BASE_URL + user.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || 'User')}&background=F43F5E&color=fff&bold=true`;
  };

  return (
    <header className="sticky top-0 bg-white/95 backdrop-blur-md z-30 border-b border-slate-200/80 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
              <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-xl tracking-tight text-slate-900 group-hover:text-rose-600 transition-colors">
              phongtro<span className="text-rose-600">365</span>
            </span>
            <span className="text-[11px] font-medium text-slate-400 -mt-1 hidden sm:inline">
              Tìm phòng trọ thông minh
            </span>
          </div>
        </Link>

        {/* Center Navigation Links for Desktop */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-full border border-slate-200/60 text-sm font-medium">
          <Link
            to="/"
            className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
              location.pathname === '/'
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            Khám phá phòng
          </Link>
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 hover:shadow-xs font-semibold cursor-pointer border border-rose-200/70"
          >
            <span className="text-sm">✨</span>
            AI Gợi ý phòng
          </button>
          <Link
            to={user ? "/account/places/new" : "/login"}
            className={`px-4 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
              location.pathname.includes('/places/new')
                ? 'bg-white text-rose-600 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Đăng tin cho thuê
          </Link>
          {user && (
            <Link
              to="/account/favourites"
              className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                location.pathname === '/account/favourites'
                  ? 'bg-white text-slate-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              Yêu thích
            </Link>
          )}
        </nav>

        {/* Right Section: Actions & User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile AI button */}
          <button
            type="button"
            onClick={() => setAiModalOpen(true)}
            className="md:hidden flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 rounded-full border border-rose-200"
          >
            <span>✨</span>
            AI Tìm phòng
          </button>

          {/* Post room CTA button for landlords */}
          <Link
            to={user ? "/account/places/new" : "/login"}
            className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-full transition-colors border border-rose-200/60"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Đăng tin mới
          </Link>

          {user && <NotificationButton />}

          {/* User Menu */}
          <div ref={menuRef} className="relative">
            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-full transition-all shadow-sm hover:shadow"
                >
                  Đăng ký
                </Link>
              </div>
            ) : (
              <div>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pl-3 border border-slate-200 rounded-full hover:shadow-md hover:border-slate-300 transition-all bg-white cursor-pointer focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                  <img
                    src={getAvatarUrl()}
                    alt="Avatar"
                    className="rounded-full w-8 h-8 object-cover ring-2 ring-rose-500/20"
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-card-hover z-50 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-150 divide-y divide-slate-100">
                    {/* User Profile Header in Dropdown */}
                    <div className="px-4 py-3 bg-slate-50/50">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user.name || 'Người dùng'}
                      </p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {user.email}
                      </p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/account"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        Trang cá nhân
                      </Link>
                      <Link
                        to="/account/bookings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
                        </svg>
                        Lịch sử đặt phòng
                      </Link>
                      <Link
                        to="/account/places"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        Phòng trọ của bạn
                      </Link>
                      <Link
                        to="/account/favourites"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                        </svg>
                        Danh sách yêu thích
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-medium transition-colors text-left cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-rose-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                        </svg>
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

      {/* AI Recommendation Modal */}
      <AiRecommendationModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
      />
    </header>
  );
}

export default Header;
