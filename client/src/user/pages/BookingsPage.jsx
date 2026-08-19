import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PlaceImg from '../components/PlaceImg';
import { Link } from 'react-router-dom';
import AccountNav from '../components/AccountNav';

function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    axios.get('/booking')
      .then(({ data }) => {
        setBookings(data || []);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const rentedBookings = bookings
    .filter(booking => booking.status === 'RENTED')
    .sort((a, b) => new Date(b.checkOut) - new Date(a.checkOut));

  const approvedBookings = bookings
    .filter(booking => booking.status === 'APPROVED' || booking.status === 'WAIT')
    .sort((a, b) => new Date(b.checkOut) - new Date(a.checkOut));

  const pendingBookings = bookings
    .filter(booking => booking.status === 'PENDING')
    .sort((a, b) => new Date(b.createAt || b.checkOut) - new Date(a.createAt || a.checkOut));

  const filteredList = tab === 'ALL'
    ? bookings
    : tab === 'APPROVED'
    ? approvedBookings
    : tab === 'PENDING'
    ? pendingBookings
    : rentedBookings;

  const formatPrice = (p) => {
    if (!p) return '0 đ';
    const num = Number(p);
    return num >= 1000000 ? (num / 1000000).toFixed(1).replace('.0', '') + ' triệu' : num + ' triệu';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Đang ở</span>;
      case 'PENDING':
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Chờ chủ trọ duyệt</span>;
      case 'WAIT':
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">Đang chờ hủy</span>;
      case 'RENTED':
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Đã hoàn thành thuê</span>;
      default:
        return <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <AccountNav />

      {/* Header bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <h1 className="text-xl font-bold text-slate-900">Lịch sử & Danh sách thuê phòng</h1>
        <p className="text-xs text-slate-500 mt-1">
          Theo dõi các hợp đồng thuê nhà hiện tại và các yêu cầu đặt phòng bạn đã gửi.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar">
        <button
          type="button"
          onClick={() => setTab('ALL')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            tab === 'ALL' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả ({bookings.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('APPROVED')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            tab === 'APPROVED' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đang ở ({approvedBookings.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('PENDING')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            tab === 'PENDING' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đang chờ duyệt ({pendingBookings.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('RENTED')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            tab === 'RENTED' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Lịch sử đã thuê ({rentedBookings.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-4 border border-slate-200 animate-pulse flex gap-4">
              <div className="w-36 h-36 bg-slate-200 rounded-2xl"></div>
              <div className="flex-1 space-y-3 py-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredList.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            📋
          </div>
          <h3 className="font-bold text-slate-800 text-base">Chưa có thông tin thuê phòng nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Khám phá danh sách phòng trọ giá tốt và gửi yêu cầu đặt lịch xem phòng ngay.
          </p>
          <Link to="/" className="primary text-xs inline-flex mt-2">
            Khám phá phòng trọ
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((booking) => (
            <Link
              key={booking.id}
              to={`/place/${booking.place?.id}`}
              className="bg-white rounded-3xl p-4 border border-slate-200/80 hover:border-slate-300 shadow-card hover:shadow-card-hover transition-all flex flex-col sm:flex-row gap-4 group"
            >
              <div className="w-full sm:w-44 h-40 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100">
                <PlaceImg place={booking.place} />
              </div>
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    {getStatusBadge(booking.status)}
                    <span className="text-sm font-extrabold text-rose-600">
                      {formatPrice(booking.place?.price)}/th
                    </span>
                  </div>
                  <h2 className="font-bold text-sm sm:text-base text-slate-900 mt-2 truncate group-hover:text-rose-600 transition-colors">
                    {booking.place?.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {booking.place?.address}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-3 text-xs text-slate-500 space-y-1">
                  {booking.checkIn && (
                    <div>Ngày bắt đầu: <strong className="text-slate-700">{new Date(booking.checkIn).toLocaleDateString('vi-VN')}</strong></div>
                  )}
                  {booking.checkOut && (
                    <div>Hạn hợp đồng: <strong className="text-slate-700">{new Date(booking.checkOut).toLocaleDateString('vi-VN')}</strong></div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default BookingsPage;
