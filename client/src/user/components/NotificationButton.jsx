import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BASE_URL } from "../../config";

const NotificationButton = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const popupRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (loading || !hasMore) return;

      setLoading(true);
      try {
        const response = await axios.get(`/post/notifications?page=${page}`);
        
        if (!response.data?.notifications || response.data.notifications.length === 0) {
          setHasMore(false);
        }
        
        if (response.data?.notifications) {
          setNotifications((prevNotifications) => {
            const newNotifications = response.data.notifications.filter(
              (notif) => !prevNotifications.some((existingNotif) => existingNotif.id === notif.id)
            );
            return [...prevNotifications, ...newNotifications];
          });
        }
        
        if (typeof response.data?.unreadCount === 'number') {
          setUnreadCount(response.data.unreadCount);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [page]);

  const handleNotificationClick = async (notificationId, placeId) => {
    try {
      await axios.post("/post/mark-as-read", { notificationId });
      setNotifications((prevNotifications) =>
        prevNotifications.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount((prevUnreadCount) => Math.max(0, prevUnreadCount - 1));
      if (placeId) {
        window.location.href = `/place/${placeId}`;
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        popupRef.current && !popupRef.current.contains(event.target) &&
        buttonRef.current && !buttonRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && !loading && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const getImgSrc = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=150';
    return url.startsWith('http') ? url : BASE_URL + url;
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="relative p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
        title="Thông báo"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex items-center justify-center rounded-full h-4 w-4 bg-rose-600 text-white text-[10px] font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {isOpen && (
        <div
          ref={popupRef}
          className="absolute mt-2 right-0 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-card-hover z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <h3 className="font-semibold text-slate-800 text-sm">Thông báo</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {unreadCount} mới
              </span>
            )}
          </div>

          <div 
            className="max-h-80 overflow-y-auto scrollbar divide-y divide-slate-100"
            onScroll={handleScroll}
          >
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto mb-2 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                </svg>
                Bạn chưa có thông báo nào.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 flex gap-3 cursor-pointer transition-colors ${
                    !notif.read ? "bg-rose-50/40 hover:bg-rose-50/70" : "hover:bg-slate-50"
                  }`}
                  onClick={() => handleNotificationClick(notif.id, notif.place?.id)}
                >
                  <img
                    src={getImgSrc(notif.place?.photos?.[0]?.url)}
                    alt="Place"
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-slate-100"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${!notif.read ? "font-semibold text-slate-900" : "text-slate-700"} line-clamp-2`}>
                      {notif.message}
                    </p>
                    <span className="inline-block mt-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      {notif.type || 'Thông báo'}
                    </span>
                  </div>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                  )}
                </div>
              ))
            )}
            {loading && <div className="p-3 text-center text-xs text-slate-500">Đang tải thêm...</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationButton;
