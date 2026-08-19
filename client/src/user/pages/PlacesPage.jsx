import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PlaceImg from '../components/PlaceImg';
import { UserContext } from '../components/UserContext';
import AccountNav from '../components/AccountNav';

function PlacesPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [showPopup, setShowPopup] = useState(false);
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get('/post/user-places')
      .then(({ data }) => {
        setPlaces(data || []);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const placesSee = places.filter(place => place.status === 'SEE');
  const placesHidden = places.filter(place => place.status === 'HIDDEN');
  const placesDelete = places.filter(place => place.status === 'DELETE');

  const filteredPlaces = activeTab === 'ALL'
    ? places
    : activeTab === 'SEE'
    ? placesSee
    : activeTab === 'HIDDEN'
    ? placesHidden
    : placesDelete;

  const handleAddPlace = () => {
    if (user?.phone && user?.zalo) {
      navigate('/account/places/new');
    } else {
      setShowPopup(true);
    }
  };

  const formatPrice = (p) => {
    if (!p) return '0 đ';
    const num = Number(p);
    return num >= 1000000 ? (num / 1000000).toFixed(1).replace('.0', '') + ' triệu' : num + ' triệu';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <AccountNav />

      {/* Header bar with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý phòng trọ của bạn</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tổng cộng: <strong className="text-slate-800">{places.length}</strong> bài đăng ({placesSee.length} đang hiển thị)
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddPlace}
          className="primary inline-flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Đăng bài phòng mới
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('ALL')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tất cả ({places.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SEE')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'SEE'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đang hiển thị ({placesSee.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('HIDDEN')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'HIDDEN'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đang ẩn ({placesHidden.length})
        </button>
        {placesDelete.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveTab('DELETE')}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              activeTab === 'DELETE'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Bị vi phạm ({placesDelete.length})
          </button>
        )}
      </div>

      {/* Places List Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-4 border border-slate-200 animate-pulse flex gap-4">
              <div className="w-36 h-36 bg-slate-200 rounded-2xl flex-shrink-0"></div>
              <div className="flex-1 space-y-3 py-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
            🏠
          </div>
          <h3 className="font-bold text-slate-800 text-base">Chưa có phòng nào trong danh mục này</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Bạn có phòng cho thuê? Hãy bấm &quot;Đăng bài phòng mới&quot; để tiếp cận hàng nghìn khách thuê ngay hôm nay.
          </p>
          <button
            type="button"
            onClick={handleAddPlace}
            className="primary text-xs inline-flex cursor-pointer mt-2"
          >
            Đăng phòng ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPlaces.map(place => {
            const pendingCount = place.bookings?.filter(b => b.status === 'PENDING').length || 0;
            const isRented = place.bookings?.some(b => b.status === 'APPROVED' || b.status === 'RENTED');

            return (
              <div
                key={place.id}
                className="bg-white rounded-3xl p-4 border border-slate-200/80 hover:border-slate-300 shadow-card hover:shadow-card-hover transition-all flex flex-col sm:flex-row gap-4 relative group"
              >
                {/* Photo */}
                <div className="w-full sm:w-44 h-40 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-100">
                  <PlaceImg place={place} />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        place.status === 'SEE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : place.status === 'HIDDEN'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {place.status === 'SEE' ? 'Hiển thị' : place.status === 'HIDDEN' ? 'Đang ẩn' : 'Vi phạm'}
                      </span>
                      <span className="text-sm font-extrabold text-rose-600">
                        {formatPrice(place.price)}/th
                      </span>
                    </div>

                    <h2 className="font-bold text-sm sm:text-base text-slate-900 mt-2 truncate group-hover:text-rose-600 transition-colors">
                      {place.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 flex-shrink-0 text-slate-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                      </svg>
                      {place.address}
                    </p>
                  </div>

                  {/* Status Badges & Quick Action Links */}
                  <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {pendingCount > 0 && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {pendingCount} khách chờ duyệt
                        </span>
                      )}
                      {isRented && (
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          Đang cho thuê
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={'/account/places/' + place.id}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                        title="Chỉnh sửa bài đăng"
                      >
                        ✏️ Sửa
                      </Link>
                      <Link
                        to={'/place/' + place.id}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors"
                      >
                        Quản lý →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Incomplete profile popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl">
              ⚠️
            </div>
            <h3 className="text-base font-bold text-slate-900">Cần bổ sung thông tin</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn cần cập nhật đầy đủ số điện thoại và Zalo trong hồ sơ cá nhân để người tìm trọ có thể liên hệ trực tiếp.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="secondary text-xs"
              >
                Để sau
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowPopup(false);
                  navigate('/account');
                }}
                className="primary text-xs"
              >
                Cập nhật ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlacesPage;
