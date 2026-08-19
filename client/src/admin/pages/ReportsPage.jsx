import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PlaceDetailsPopup from '../components/PlaceDetailPopup';

function ReportsPage() {
  const [pendingReports, setPendingReports] = useState([]);
  const [normalPlaces, setNormalPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedReports, setSelectedReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('REPORTS');

  useEffect(() => {
    setLoading(true);
    axios.get('/admin-api/get-places')
      .then(response => {
        const allPlaces = response.data.places || [];

        const placesWithPendingReports = allPlaces
          .map(place => ({
            ...place,
            pendingReportCount: place.reports?.filter(report => report.status === 'PENDING').length || 0
          }))
          .filter(place => place.pendingReportCount > 0)
          .sort((a, b) => b.pendingReportCount - a.pendingReportCount);

        const normal = allPlaces.filter(
          place => 
            place.status !== 'DELETE' &&
            (!place.reports || place.reports.every(report => report.status !== 'PENDING'))
        );

        setPendingReports(placesWithPendingReports);
        setNormalPlaces(normal);
      })
      .catch(error => {
        console.error('Error fetching places:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const closeReportsPopup = () => setSelectedReports(null);
  const closeDetailsPopup = () => setSelectedPlace(null);

  const handleDeletePlace = async (placeId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài đăng nhà trọ này do vi phạm quy định?')) {
      try {
        const response = await axios.post(`/admin-api/delete-place/${placeId}`);
        alert(response.data.message || 'Ngôi nhà đã được xóa.');
        window.location.reload();
      } catch (error) {
        console.error('Error deleting place:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa ngôi nhà.');
      }
    }
  };

  const handleMarkAsNormal = async (placeId) => {
    if (window.confirm('Xác nhận bài đăng này không vi phạm và hoàn tất xử lý các báo cáo?')) {
      try {
        const response = await axios.post(`/admin-api/mark-place-normal/${placeId}`);
        alert(response.data.message || 'Ngôi nhà đã được đánh dấu là bình thường.');
        window.location.reload();
      } catch (error) {
        console.error('Error marking place as normal:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi đánh dấu nhà này.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Báo cáo & Bài đăng</h1>
        <p className="text-xs text-slate-500 mt-1">
          Duyệt và xử lý các bài đăng có dấu hiệu vi phạm hoặc bị người dùng phản hồi tiêu cực.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('REPORTS')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'REPORTS'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Cần xử lý ({pendingReports.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('NORMAL')}
          className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
            activeTab === 'NORMAL'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Đang hoạt động ({normalPlaces.length})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse h-28"></div>
          ))}
        </div>
      ) : activeTab === 'REPORTS' ? (
        pendingReports.length > 0 ? (
          <div className="space-y-4">
            {pendingReports.map(place => (
              <div
                key={place.id}
                className="bg-white border-2 border-rose-200/90 rounded-3xl p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-rose-100 text-rose-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                      ⚠️ {place.pendingReportCount} lượt báo cáo
                    </span>
                    <span className="text-xs text-slate-400">ID: #{place.id}</span>
                  </div>
                  <h2
                    className="text-base font-bold text-slate-900 cursor-pointer hover:text-rose-600 transition-colors"
                    onClick={() => setSelectedPlace(place)}
                  >
                    {place.title}
                  </h2>
                  <p className="text-xs text-slate-500">📍 {place.address}</p>
                  <p className="text-xs text-slate-400">Chủ trọ: <strong className="text-slate-700">{place.owner?.name}</strong> ({place.owner?.phone || 'Chưa có SĐT'})</p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSelectedReports(place.reports)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Xem lý do ({place.reports?.length || 0})
                  </button>
                  <button
                    onClick={() => handleMarkAsNormal(place.id)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    Bình thường (Hủy phạt)
                  </button>
                  <button
                    onClick={() => handleDeletePlace(place.id)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer shadow-sm"
                  >
                    Xóa vi phạm
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
            <p className="text-sm font-semibold text-slate-700">🎉 Tuyệt vời! Hiện tại không có bài đăng nào bị báo cáo.</p>
          </div>
        )
      ) : (
        normalPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {normalPlaces.map(place => (
              <div
                key={place.id}
                className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <h2
                    className="text-sm font-bold text-slate-900 cursor-pointer hover:text-rose-600 transition-colors line-clamp-1"
                    onClick={() => setSelectedPlace(place)}
                  >
                    {place.title}
                  </h2>
                  <p className="text-xs text-slate-500 line-clamp-1">📍 {place.address}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 mt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Chủ: {place.owner?.name || 'Ẩn danh'}</span>
                  <button
                    onClick={() => setSelectedPlace(place)}
                    className="text-rose-600 hover:underline font-semibold"
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-sm text-slate-500">Chưa có bài đăng nào.</p>
          </div>
        )
      )}

      {/* Place Details Popup */}
      {selectedPlace && (
        <PlaceDetailsPopup place={selectedPlace} onClose={closeDetailsPopup} />
      )}

      {/* Reports List Popup */}
      {selectedReports && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeReportsPopup}
        >
          <div
            className="bg-white p-6 sm:p-8 rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900">Chi tiết phản hồi / Báo cáo</h2>
              <button onClick={closeReportsPopup} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <div className="space-y-3">
              {selectedReports.map((report) => (
                <div key={report.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-800">{report.reporter?.name || 'Người dùng ẩn danh'}</strong>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      report.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-slate-500">Email: {report.reporter?.email || 'N/A'}</p>
                  <p className="text-slate-500">SĐT: {report.reporter?.phone || 'N/A'}</p>
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-slate-800 font-medium">Lý do: &quot;{report.reason}&quot;</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={closeReportsPopup} className="secondary text-xs">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReportsPage;
