import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../config';

export default function AiPlaceInsight({ placeId, currentPlace }) {
  const [analysis, setAnalysis] = useState(null);
  const [similarRecs, setSimilarRecs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!placeId) return;
    setLoading(true);

    // Call analyze-place
    const p1 = axios.post('/api/ai/analyze-place', { placeId })
      .then(res => setAnalysis(res.data.analysis))
      .catch(err => console.warn('AI analysis error:', err));

    // Call recommend for similar places
    const p2 = axios.post('/api/ai/recommend', {
      currentPlaceId: placeId,
      budgetMax: currentPlace?.price ? currentPlace.price * 1.25 : 10000000,
      preferredArea: currentPlace?.address ? currentPlace.address.split(',').slice(-2).join(',').trim() : '',
      prompt: `Tìm phòng tương tự phòng trọ giá ${(currentPlace?.price/1000000).toFixed(1)} triệu tại ${currentPlace?.address}`,
    })
      .then(res => setSimilarRecs((res.data.recommendations || []).slice(0, 3)))
      .catch(err => console.warn('AI similar rec error:', err));

    Promise.all([p1, p2]).finally(() => setLoading(false));
  }, [placeId, currentPlace]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-rose-50/50 to-amber-50/40 rounded-3xl p-6 border border-rose-100/80 my-6 animate-pulse">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full bg-rose-200"></div>
          <div className="h-4 bg-rose-200 rounded w-48"></div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-rose-100 rounded w-full"></div>
          <div className="h-3 bg-rose-100 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl my-8 relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-xl shadow-lg shadow-rose-500/20">
              ✨
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
                Trợ Lý AI Thẩm Định & Gợi Ý Phòng
                <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AI Insight
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Phân tích khách quan dành cho người đi thuê dựa trên dữ liệu thị trường
              </p>
            </div>
          </div>

          {analysis?.estimatedMonthlyExpenses && (
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs">
              <span className="text-slate-300">Ước tính trọn gói/tháng: </span>
              <span className="font-bold text-amber-300">{analysis.estimatedMonthlyExpenses}</span>
            </div>
          )}
        </div>

        {/* Suitability & Pros/Cons */}
        {analysis && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Suitability */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider block mb-1">
                  🎯 Đối tượng phù hợp nhất
                </span>
                <p className="text-sm font-medium text-slate-200 leading-relaxed">
                  {analysis.suitability}
                </p>
              </div>
            </div>

            {/* Pros */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-2">
                ✓ Điểm cộng nổi bật
              </span>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {analysis.pros?.map((pro, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold shrink-0">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons / Notes */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider block mb-2">
                ⚠️ Lưu ý khi đi thuê
              </span>
              <ul className="space-y-1.5 text-xs text-slate-200">
                {analysis.cons?.map((con, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold shrink-0">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Similar Recommendations */}
        {similarRecs.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-1.5">
              <span>🏠 Phòng trọ tương tự được AI đề xuất cho bạn:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {similarRecs.map((rec) => {
                const p = rec.place;
                if (!p) return null;
                const photo = p.photos?.[0]?.url 
                  ? (p.photos[0].url.startsWith('http') ? p.photos[0].url : BASE_URL + p.photos[0].url)
                  : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&auto=format&fit=crop&q=80';

                return (
                  <Link
                    key={p.id}
                    to={`/place/${p.id}`}
                    className="bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl p-3 transition-all flex flex-col group"
                  >
                    <div className="h-28 rounded-xl overflow-hidden mb-2 relative bg-slate-950">
                      <img
                        src={photo}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-1.5 left-1.5 bg-rose-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-md">
                        {(p.price / 1000000).toFixed(1)} tr/tháng
                      </div>
                      <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white font-bold text-[10px] px-1.5 py-0.5 rounded-md">
                        {rec.matchScore}% Match
                      </div>
                    </div>
                    <h5 className="text-xs font-bold text-white group-hover:text-rose-400 line-clamp-1 transition-colors">
                      {p.title}
                    </h5>
                    <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                      {p.address}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
