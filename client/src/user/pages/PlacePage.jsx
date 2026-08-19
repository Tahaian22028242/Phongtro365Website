import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import BookingWidget from '../components/BookingWidget';
import PlaceGallery from '../components/PlaceGallery';
import { UserContext } from '../components/UserContext';
import PlaceDetail from './PlaceDetail';
import { differenceInCalendarMonths, differenceInDays, format } from 'date-fns';
import InvoiceDetailRenter from '../components/InvoiceDetailRenter';
import MapComponent from '../components/MapComponent';
import { BASE_URL } from '../../config';
import CommentsSection from '../components/CommentsSection';
import UserRentHistory from '../components/UserRentHistory';
import PlaceFav from '../components/PlaceFav';
import AiPlaceInsight from '../components/AiPlaceInsight';

const perkLabels = {
  wifi: { label: 'Wifi tốc độ cao', icon: '📶' },
  parking: { label: 'Chỗ gửi xe an ninh', icon: '🛵' },
  elevator: { label: 'Thang máy tiện lợi', icon: '🛗' },
  washing: { label: 'Máy giặt chung', icon: '🧺' },
  pets: { label: 'Cho phép thú cưng', icon: '🐾' },
  clean: { label: 'Dịch vụ dọn vệ sinh', icon: '🧹' },
  tv: { label: 'Tivi truyền hình cáp', icon: '📺' },
  kitchen: { label: 'Khu vực bếp riêng', icon: '🍳' },
  air_conditioner: { label: 'Điều hòa nhiệt độ', icon: '❄️' },
  water_heater: { label: 'Bình nóng lạnh', icon: '🚿' },
};

function PlacePage() {
  const { id } = useParams();
  const { user } = useContext(UserContext);
  const [place, setPlace] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [showReportsPopup, setShowReportsPopup] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    axios.get(`/post/place/${id}`)
      .then((response) => {
        setPlace(response.data.place);
      })
      .catch((error) => {
        console.error("There was an error fetching the place data!", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (user && user.id && place?.bookings) {
      const userBooking = place.bookings.find(
        (booking) =>
          booking.renterId === user.id &&
          booking.status !== 'RENTED' &&
          booking.status !== 'REJECTED'
      );
      setBookingDetail(userBooking);
    }
  }, [place?.bookings, user]);

  async function continueRent(ev, bookingId, placeId) {
    ev.preventDefault();
    await axios.put('/booking/continue-rent', { bookingId, placeId });
    window.location.reload();
  }

  async function notContinueRent(ev, bookingId) {
    ev.preventDefault();
    await axios.put('/booking/not-continue-rent', { bookingId });
    window.location.reload();
  }

  async function notRentRequest(ev, bookingId) {
    ev.preventDefault();
    await axios.put('/booking/not-rent-request', { bookingId });
    window.location.reload();
  }

  async function undoNotRentRequest(ev, bookingId) {
    ev.preventDefault();
    await axios.put('/booking/undo-not-rent-request', { bookingId });
    window.location.reload();
  }

  const handleSendReport = async () => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do báo cáo.');
      return;
    }
    try {
      const response = await axios.post('/post/add-report', {
        reason: reason,
        placeId: id,
      });
      alert(response.data.message || 'Đã gửi báo cáo thành công!');
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi gửi báo cáo!');
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-xl w-2/3"></div>
        <div className="h-4 bg-slate-200 rounded-lg w-1/3"></div>
        <div className="aspect-[16/9] max-h-[400px] bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="h-40 bg-slate-200 rounded-3xl"></div>
            <div className="h-40 bg-slate-200 rounded-3xl"></div>
          </div>
          <div className="h-80 bg-slate-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl p-8 border border-slate-200 space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy thông tin phòng trọ</h2>
        <p className="text-sm text-slate-500">Phòng trọ này có thể đã bị xóa hoặc liên kết không tồn tại.</p>
        <Link to="/" className="primary inline-flex mx-auto">Quay lại trang chủ</Link>
      </div>
    );
  }

  // If viewing own place as host, render host management view
  if (user && user.id === place.ownerId) {
    return <PlaceDetail />;
  }

  const bookingNow = place.bookings?.find(b => b.status === "APPROVED") || place.bookings?.find(b => b.status === "WAIT");
  const bookingRented = place.bookings?.filter(b => b.status === "RENTED" && user && b.renterId === user.id) || [];
  const reported = user && place?.reports?.find(r => r.reporterId === user.id);

  let rentBanner = null;
  let showBookingCard = true;

  if (bookingDetail) {
    if (bookingDetail.status === 'PENDING') {
      rentBanner = (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              ⏳
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-900">Yêu cầu thuê đang chờ duyệt</h3>
              <p className="text-xs text-amber-700">Chủ trọ đang xem xét yêu cầu của bạn. Bạn sẽ nhận được thông báo khi có kết quả.</p>
            </div>
          </div>
        </div>
      );
    } else if (bookingDetail.status === 'APPROVED') {
      showBookingCard = false;
      const today = new Date();
      const checkOutDate = new Date(bookingDetail.checkOut);
      const monthsRemaining = differenceInCalendarMonths(checkOutDate, today);
      const startOfNextMonth = new Date(today.getFullYear(), today.getMonth() + monthsRemaining, 1);
      const remainingDaysInMonth = differenceInDays(checkOutDate, startOfNextMonth);

      rentBanner = (
        <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              🏠
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-900">Bạn đang thuê phòng này!</h3>
              <p className="text-xs text-emerald-700">Hạn hợp đồng: {format(checkOutDate, 'dd/MM/yyyy')} (Còn {monthsRemaining} tháng {remainingDaysInMonth} ngày)</p>
            </div>
          </div>

          {monthsRemaining === 0 && !bookingDetail.isContinue && (
            <div className="flex gap-3 pt-2">
              <button onClick={(ev) => continueRent(ev, bookingDetail.id, id)} className="primary text-xs">
                Gia hạn ở tiếp
              </button>
              <button onClick={(ev) => notContinueRent(ev, bookingDetail.id)} className="secondary text-xs">
                Không tiếp tục ở
              </button>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <button onClick={(ev) => notRentRequest(ev, bookingDetail.id)} className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline cursor-pointer">
              Yêu cầu trả phòng / Hủy hợp đồng
            </button>
          </div>
          <InvoiceDetailRenter bookingId={bookingDetail.id} />
        </div>
      );
    } else if (bookingDetail.status === 'WAIT') {
      showBookingCard = false;
      rentBanner = (
        <div className="p-6 bg-slate-100 border border-slate-200 rounded-3xl space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Bạn đã gửi yêu cầu hủy thuê phòng</h3>
          <button onClick={(ev) => undoNotRentRequest(ev, bookingDetail.id)} className="primary text-xs">
            Hoàn tác yêu cầu hủy thuê
          </button>
          <InvoiceDetailRenter bookingId={bookingDetail.id} />
        </div>
      );
    }
  }

  const formatPrice = (p) => {
    if (!p) return '0 đ';
    const num = Number(p);
    return num >= 1000000 ? (num / 1000000).toFixed(1).replace('.0', '') + ' triệu' : num + ' triệu';
  };

  const getOwnerAvatar = () => {
    if (place.owner?.avatar) {
      return place.owner.avatar.startsWith('http') ? place.owner.avatar : BASE_URL + place.owner.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(place.owner?.name || 'Host')}&background=0F172A&color=fff&bold=true`;
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2 font-medium">
            <Link to="/" className="hover:text-slate-700">Trang chủ</Link>
            <span>/</span>
            <span className="text-slate-600 truncate max-w-xs">{place.title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 leading-tight">
            {place.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-rose-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              <span>{place.address}</span>
            </div>
            {place.latitude && (
              <div className="flex items-center gap-2">
                <MapComponent places={[place]} />
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(place.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-rose-600 hover:text-rose-700 font-semibold underline"
                >
                  Google Maps
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Favorite & Report buttons */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <PlaceFav place={place} />
          <button
            type="button"
            onClick={() => setIsPopupOpen(true)}
            className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            title="Báo cáo bài đăng"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Rented / Status Banner */}
      {rentBanner}

      {/* Place Photo Gallery */}
      <PlaceGallery place={place} />

      {/* Main Grid: Details Left, Booking Card Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        {/* Left Column: Details */}
        <div className="lg:col-span-8 space-y-8">
          {/* Quick Stat Highlights Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
              <p className="text-xs text-slate-400 font-medium">Giá thuê</p>
              <p className="text-base font-extrabold text-rose-600 mt-1">{formatPrice(place.price)}/th</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
              <p className="text-xs text-slate-400 font-medium">Diện tích</p>
              <p className="text-base font-bold text-slate-900 mt-1">{place.area || 25} m²</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
              <p className="text-xs text-slate-400 font-medium">Hợp đồng</p>
              <p className="text-base font-bold text-slate-900 mt-1">{place.duration || 6} tháng</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-card">
              <p className="text-xs text-slate-400 font-medium">Trạng thái</p>
              <p className="text-base font-bold text-emerald-600 mt-1">Còn phòng</p>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 text-rose-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
              Mô tả chi tiết
            </h2>
            <div
              className="text-slate-600 text-sm leading-relaxed space-y-3 prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: place.description }}
            />
          </div>

          {/* Amenities & Services */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 text-rose-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
              Tiện ích & Dịch vụ đi kèm
            </h2>

            {place.perks && place.perks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                {place.perks.map((item, idx) => {
                  const perkInfo = perkLabels[item.perk] || { label: item.perk, icon: '✨' };
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center gap-3 text-slate-800 text-xs font-semibold"
                    >
                      <span className="text-lg">{perkInfo.icon}</span>
                      <span>{perkInfo.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Chưa có thông tin tiện ích cụ thể.</p>
            )}
          </div>

          {/* Extra Info Note if present */}
          {place.extraInfo && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 text-rose-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                </svg>
                Lưu ý từ chủ nhà
              </h2>
              <div
                className="text-slate-600 text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: place.extraInfo }}
              />
            </div>
          )}

          {/* AI Place Insight & Recommendation Engine */}
          <AiPlaceInsight placeId={place.id} currentPlace={place} />

          {/* Landlord / Host Profile Card */}
          {place.owner && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-5 h-5 text-rose-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                Thông tin chủ trọ
              </h2>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={getOwnerAvatar()}
                    alt={place.owner.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm"
                  />
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{place.owner.name}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Tham gia từ {new Date(place.owner.createAt || Date.now()).toLocaleDateString('vi-VN')}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1.5 border border-emerald-100">
                      ✓ Đã xác thực thông tin
                    </span>
                  </div>
                </div>

                {/* Direct Action Contacts */}
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {place.owner.phone && (
                    <a
                      href={`tel:${place.owner.phone}`}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                      </svg>
                      Gọi điện
                    </a>
                  )}
                  {place.owner.phone && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(place.owner.phone)}
                      className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      {copiedPhone ? 'Đã chép số!' : 'Sao chép SĐT'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Comments Section */}
          <CommentsSection placeId={place.id} userId={user?.id} />

          {/* User Rent History Section */}
          {bookingRented.length > 0 && (
            <UserRentHistory rentHistory={bookingRented} />
          )}
        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="lg:col-span-4">
          {showBookingCard && <BookingWidget place={place} />}
        </div>
      </div>

      {/* Report Modal */}
      {isPopupOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsPopupOpen(false)}
        >
          <div
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Báo cáo bài đăng này</h3>
              <button
                type="button"
                onClick={() => setIsPopupOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {reported ? (
              <div className="space-y-3 py-2">
                <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
                  Bạn đã gửi báo cáo cho bài đăng này vào danh sách xem xét của Quản trị viên.
                </div>
                <p className="text-xs text-slate-500">
                  <strong>Trạng thái:</strong> {reported.status === 'PENDING' ? 'Đang chờ xử lý' : 'Đã xử lý'}
                </p>
                <p className="text-xs text-slate-500">
                  <strong>Lý do bạn báo cáo:</strong> {reported.reason}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Nếu bạn phát hiện thông tin bài đăng không đúng sự thật, lừa đảo, hoặc giá cả không khớp, hãy cho chúng tôi biết.
                </p>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Mô tả chi tiết lý do bạn báo cáo..."
                  className="w-full text-xs"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPopupOpen(false)}
                    className="secondary text-xs"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleSendReport}
                    className="primary text-xs"
                  >
                    Gửi báo cáo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlacePage;
