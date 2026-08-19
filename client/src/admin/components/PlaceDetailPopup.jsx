import React from 'react';
import MapComponent from '../../user/components/MapComponent';
import PlaceGallery from '../../user/components/PlaceGallery';
import { BASE_URL } from '../../config';

const PlaceDetailsPopup = ({ place, onClose }) => {
  if (!place) return null;

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
    <div
      id="popup-overlay"
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target.id === 'popup-overlay' && onClose()}
    >
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{place.title}</h1>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              📍 {place.address}
            </p>
          </div>
          <button
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
            onClick={onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Gallery */}
        <PlaceGallery place={place} />

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
            <p className="text-xs text-slate-400">Giá thuê</p>
            <p className="text-base font-extrabold text-rose-600 mt-0.5">{formatPrice(place.price)}/th</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
            <p className="text-xs text-slate-400">Diện tích</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">{place.area || 25} m²</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
            <p className="text-xs text-slate-400">Hợp đồng</p>
            <p className="text-base font-bold text-slate-800 mt-0.5">{place.duration || 6} tháng</p>
          </div>
        </div>

        {/* Landlord Info Card */}
        {place.owner && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Thông tin chủ nhà</h3>
            <div className="flex items-center gap-4">
              <img
                src={getOwnerAvatar()}
                alt={place.owner.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white shadow-sm"
              />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-900 text-sm">{place.owner.name}</p>
                <p className="text-slate-500">Email: {place.owner.email}</p>
                <p className="text-slate-700 font-semibold">SĐT: {place.owner.phone || 'Chưa cập nhật'} | Zalo: {place.owner.zalo || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="space-y-2">
          <h3 className="font-bold text-sm text-slate-900">Mô tả phòng trọ</h3>
          <div
            className="text-xs text-slate-600 leading-relaxed space-y-2 prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: place.description }}
          />
        </div>

        {/* Extra notes */}
        {place.extraInfo && (
          <div className="space-y-2 border-t border-slate-100 pt-3">
            <h3 className="font-bold text-sm text-slate-900">Lưu ý thêm</h3>
            <div
              className="text-xs text-slate-600 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: place.extraInfo }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceDetailsPopup;
