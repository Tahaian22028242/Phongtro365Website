import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext';

function BookingWidget({ place }) {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [isBooked, setIsBooked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      const userBooking = place?.bookings?.find(
        (booking) => booking.renterId === user.id && booking.status === 'PENDING'
      );
      setIsBooked(!!userBooking);
    }
  }, [place?.bookings, user]);

  async function bookThisPlace() {
    if (!user) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/booking', { placeId: place.id });
      setIsBooked(true);
      window.location.reload();
    } catch (error) {
      console.error("Booking error:", error);
      alert(error.response?.data?.error || "Đặt phòng thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  async function cancelBooking() {
    setLoading(true);
    try {
      await axios.post('/booking/cancel-booking', { placeId: place.id });
      setIsBooked(false);
      window.location.reload();
    } catch (error) {
      console.error("Cancellation failed:", error);
      alert("Hủy đặt phòng thất bại.");
    } finally {
      setLoading(false);
    }
  }

  const formatPrice = (p) => {
    if (!p) return '0';
    const num = Number(p);
    return num >= 1000000 ? (num / 1000000).toFixed(1).replace('.0', '') + ' triệu' : num + ' triệu';
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card border border-slate-200/80 sticky top-28 space-y-5">
      {/* Price Header */}
      <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-2xl font-extrabold text-rose-600">
            {formatPrice(place.price)}
          </span>
          <span className="text-xs text-slate-500 font-medium ml-1">/tháng</span>
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Đang có sẵn
        </span>
      </div>

      {/* Highlights info */}
      <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
        <div className="flex justify-between">
          <span className="text-slate-500">Diện tích:</span>
          <span className="font-semibold text-slate-800">{place.area || 25} m²</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Hợp đồng tối thiểu:</span>
          <span className="font-semibold text-slate-800">{place.duration || 6} tháng</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Hình thức cọc:</span>
          <span className="font-semibold text-slate-800">1 tháng tiền phòng</span>
        </div>
      </div>

      {/* Action Button */}
      {!isBooked ? (
        <button
          type="button"
          onClick={bookThisPlace}
          disabled={loading}
          className="primary w-full py-3 text-base shadow-md hover:shadow-lg font-bold cursor-pointer"
        >
          {loading ? "Đang xử lý..." : "Đặt lịch hẹn / Thuê phòng"}
        </button>
      ) : (
        <div className="space-y-2">
          <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200 text-center font-medium">
            Bạn đã gửi yêu cầu thuê phòng này. Vui lòng chờ chủ trọ duyệt.
          </div>
          <button
            type="button"
            onClick={cancelBooking}
            disabled={loading}
            className="w-full py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors cursor-pointer"
          >
            {loading ? "Đang hủy..." : "Hủy yêu cầu đặt phòng"}
          </button>
        </div>
      )}

      {/* Host Call CTA */}
      {place.owner?.phone && (
        <a
          href={`tel:${place.owner.phone}`}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center justify-center gap-2 transition-colors border border-slate-200/60"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4 text-emerald-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
          </svg>
          Gọi chủ trọ: {place.owner.phone}
        </a>
      )}

      <p className="text-[11px] text-center text-slate-400">
        🛡️ Được bảo vệ bởi cam kết minh bạch và an toàn của Phongtro365
      </p>
    </div>
  );
}

export default BookingWidget;
