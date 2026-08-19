import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function AccountNav() {
  const { pathname } = useLocation();

  let subpage = pathname.split('/')?.[2];
  if (subpage === undefined) {
    subpage = 'profile';
  }

  function linkClasses(type = null) {
    let classes = 'inline-flex items-center gap-2 py-2.5 px-5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ';
    if (type === subpage) {
      classes += 'bg-rose-600 text-white shadow-sm shadow-rose-500/20';
    } else {
      classes += 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900';
    }
    return classes;
  }

  return (
    <nav className="w-full flex justify-center gap-2 sm:gap-3 my-6 flex-wrap">
      <Link className={linkClasses('profile')} to="/account">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
        Hồ sơ cá nhân
      </Link>
      <Link className={linkClasses('places')} to="/account/places">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        Phòng đã đăng
      </Link>
      <Link className={linkClasses('bookings')} to="/account/bookings">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0 1 20.25 6v12A2.25 2.25 0 0 1 18 20.25H6A2.25 2.25 0 0 1 3.75 18V6A2.25 2.25 0 0 1 6 3.75h1.5m9 0h-9" />
        </svg>
        Lịch sử thuê phòng
      </Link>
      <Link className={linkClasses('favourites')} to="/account/favourites">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
        Yêu thích
      </Link>
    </nav>
  );
}

export default AccountNav;
