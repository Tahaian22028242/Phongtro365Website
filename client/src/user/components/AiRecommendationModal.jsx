import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../../config';

const PERSONAS = [
  {
    id: 'student',
    label: 'Sinh viên',
    icon: '🎓',
    desc: 'Ưu tiên giá mềm, gần trường ĐH, wifi mạnh, giờ tự do',
    defaultBudget: 3500000,
    defaultPerks: ['wifi', 'parking', 'time'],
    promptSuggestion: 'Tìm phòng trọ sinh viên gần trường học, giá rẻ, giờ giấc tự do, có chỗ để xe máy an toàn.'
  },
  {
    id: 'worker',
    label: 'Dân văn phòng / Chuyên gia',
    icon: '💼',
    desc: 'Studio / Căn hộ mini full đồ, thang máy, máy giặt, yên tĩnh',
    defaultBudget: 5500000,
    defaultPerks: ['air_conditioner', 'elevator', 'washing_machine', 'kitchen'],
    promptSuggestion: 'Tìm phòng studio hoặc căn hộ mini full nội thất, có điều hòa máy giặt thang máy, khu vực an ninh yên tĩnh.'
  },
  {
    id: 'sleepbox',
    label: 'Sleepbox / KTX cao cấp',
    icon: '🛌',
    desc: 'Bao trọn gói điện nước máy lạnh 24/7, cực kỳ tiết kiệm',
    defaultBudget: 2000000,
    defaultPerks: ['air_conditioner', 'wifi', 'security'],
    promptSuggestion: 'Tìm sleepbox hoặc giường ký túc xá cao cấp trọn gói chi phí, sạch sẽ, máy lạnh 24/24.'
  },
  {
    id: 'couple',
    label: 'Cặp đôi / Ở ghép 2-3 người',
    icon: '👫',
    desc: 'Phòng rộng 25-40m², nấu ăn riêng, ban công thoáng sáng',
    defaultBudget: 6000000,
    defaultPerks: ['kitchen', 'balcony', 'pet', 'parking'],
    promptSuggestion: 'Tìm phòng 1 ngủ 1 khách hoặc căn hộ 1PN thoáng mát cho 2 người ở, cho nấu ăn riêng và có ban công.'
  },
];

const POPULAR_LOCATIONS = [
  'Tất cả khu vực',
  'Cầu Giấy, Hà Nội',
  'Đống Đa, Hà Nội',
  'Hai Bà Trưng, Hà Nội',
  'Thanh Xuân, Hà Nội',
  'Bình Thạnh, TP.HCM',
  'Quận 1, TP.HCM',
  'Thủ Đức, TP.HCM',
];

const PERK_OPTIONS = [
  { id: 'air_conditioner', label: 'Điều hòa' },
  { id: 'elevator', label: 'Thang máy' },
  { id: 'washing_machine', label: 'Máy giặt' },
  { id: 'kitchen', label: 'Bếp nấu ăn' },
  { id: 'balcony', label: 'Ban công' },
  { id: 'parking', label: 'Chỗ để xe' },
  { id: 'wifi', label: 'Wifi tốc độ cao' },
  { id: 'security', label: 'Bảo vệ / Camera' },
  { id: 'pet', label: 'Cho nuôi thú cưng' },
  { id: 'time', label: 'Giờ giấc tự do' },
];

export default function AiRecommendationModal({ isOpen, onClose, initialQuery = '' }) {
  const [selectedPersona, setSelectedPersona] = useState('student');
  const [budgetMax, setBudgetMax] = useState(4000000);
  const [preferredArea, setPreferredArea] = useState('Tất cả khu vực');
  const [selectedPerks, setSelectedPerks] = useState(['wifi', 'parking']);
  const [customPrompt, setCustomPrompt] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      setCustomPrompt(initialQuery);
    }
  }, [initialQuery]);

  const handleSelectPersona = (p) => {
    setSelectedPersona(p.id);
    setBudgetMax(p.defaultBudget);
    setSelectedPerks(p.defaultPerks);
    if (!customPrompt || PERSONAS.some(pers => pers.promptSuggestion === customPrompt)) {
      setCustomPrompt(p.promptSuggestion);
    }
  };

  const togglePerk = (id) => {
    setSelectedPerks(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await axios.post('/api/ai/recommend', {
        prompt: customPrompt,
        budgetMax: Number(budgetMax),
        preferredArea: preferredArea === 'Tất cả khu vực' ? '' : preferredArea,
        perks: selectedPerks,
        persona: selectedPersona,
      });
      setResult(response.data);
    } catch (err) {
      console.error('Failed to get AI recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !result && !hasSearched) {
      fetchRecommendations();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight font-display">
                  AI Trợ Lý Tìm Phòng Trọ Thông Minh
                </h2>
                <span className="bg-white/25 text-white text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  Gemini 3.7 AI
                </span>
              </div>
              <p className="text-white/90 text-sm mt-0.5">
                Đề xuất phòng trọ tối ưu hóa theo phong cách sống, ngân sách và vị trí của người đi thuê
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          
          {/* Section 1: Persona Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2.5">
              1. Bạn là đối tượng người thuê nào?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              {PERSONAS.map(p => {
                const isSelected = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPersona(p)}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-rose-50/90 border-rose-500 shadow-sm ring-2 ring-rose-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-2xl mb-1.5">{p.icon}</div>
                    <div className={`font-bold text-sm ${isSelected ? 'text-rose-700' : 'text-slate-800'}`}>
                      {p.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Smart Filter Criteria */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            {/* Budget */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  Ngân sách tối đa:
                </label>
                <span className="text-rose-600 font-bold text-base">
                  {(budgetMax / 1000000).toFixed(1)} triệu / tháng
                </span>
              </div>
              <input
                type="range"
                min="1500000"
                max="12000000"
                step="500000"
                value={budgetMax}
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>1.5 tr (KTX/Sleepbox)</span>
                <span>5 tr (Studio)</span>
                <span>12 tr (Căn hộ)</span>
              </div>
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Khu vực mong muốn:
              </label>
              <select
                value={preferredArea}
                onChange={(e) => setPreferredArea(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              >
                {POPULAR_LOCATIONS.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Perks selection */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tiện ích mong muốn:
              </label>
              <div className="flex flex-wrap gap-2">
                {PERK_OPTIONS.map(perk => {
                  const active = selectedPerks.includes(perk.id);
                  return (
                    <button
                      key={perk.id}
                      type="button"
                      onClick={() => togglePerk(perk.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
                        active
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {active ? '✓ ' : '+ '} {perk.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Natural Language Prompt */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              2. Mô tả nhu cầu tự do bằng lời nói / văn bản (AI sẽ hiểu và phân tích sâu):
            </label>
            <div className="relative">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="VD: Em cần tìm phòng trọ khép kín gần ĐH Bách Khoa, có điều hòa, giá dưới 3 triệu..."
                className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3.5 pr-28 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-xs"
                onKeyDown={(e) => e.key === 'Enter' && fetchRecommendations()}
              />
              <button
                type="button"
                onClick={fetchRecommendations}
                disabled={loading}
                className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white px-4 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>
                    <span>✨ Phân tích</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 4: AI Recommendations Result List */}
          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">
                  Kết quả gợi ý từ AI
                </h3>
                {result?.isAiPowered && (
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    Gemini Live Matched
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500">
                {result?.recommendations?.length || 0} phòng được xếp hạng
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-10 h-10 border-3 border-rose-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-medium text-slate-700">
                  AI đang đối chiếu dữ liệu phòng trọ, tính toán độ phù hợp và phân tích chi phí...
                </p>
              </div>
            ) : result?.recommendations?.length > 0 ? (
              <div className="space-y-4">
                {result.recommendations.map((rec, index) => {
                  const place = rec.place;
                  if (!place) return null;
                  const photoUrl = place.photos?.[0]?.url 
                    ? (place.photos[0].url.startsWith('http') ? place.photos[0].url : BASE_URL + place.photos[0].url)
                    : 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80';

                  return (
                    <div
                      key={place.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-rose-200 transition-all flex flex-col sm:flex-row gap-4 group"
                    >
                      {/* Place Image */}
                      <div className="w-full sm:w-44 h-36 rounded-xl overflow-hidden relative shrink-0 bg-slate-100">
                        <img
                          src={photoUrl}
                          alt={place.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                          #{index + 1}
                        </div>
                        <div className="absolute bottom-2 left-2 bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-xs">
                          {(place.price / 1000000).toFixed(1)} tr/tháng
                        </div>
                      </div>

                      {/* Info & Match Breakdown */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <Link
                              to={`/place/${place.id}`}
                              onClick={onClose}
                              className="font-bold text-slate-900 hover:text-rose-600 text-base line-clamp-1 transition-colors"
                            >
                              {place.title}
                            </Link>
                            
                            {/* Match Score Badge */}
                            <div className="shrink-0 flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold">
                              <span>✨ {rec.matchScore}%</span>
                              <span className="hidden sm:inline font-medium text-[11px]">Tương thích</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                            </svg>
                            {place.address} • {place.area}m²
                          </p>

                          {/* AI Match Reason */}
                          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 text-xs text-amber-900 mb-2.5">
                            <span className="font-semibold text-amber-950">💡 Vì sao phù hợp: </span>
                            {rec.matchReason}
                          </div>

                          {/* Highlights pills */}
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {rec.highlights?.map((h, i) => (
                              <span
                                key={i}
                                className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md"
                              >
                                ✓ {h}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                          <span className="text-xs text-slate-500 font-medium">
                            Đánh giá: <span className="text-slate-800 font-semibold">{rec.budgetSuitability}</span>
                          </span>
                          <Link
                            to={`/place/${place.id}`}
                            onClick={onClose}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3.5 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1"
                          >
                            Xem chi tiết phòng & liên hệ
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* AI Advice Box */}
                {result.generalAdvice && (
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 mt-4">
                    <div className="flex items-center gap-2 font-bold text-blue-950 mb-1">
                      <span>📌 Lời khuyên từ AI cho người thuê:</span>
                    </div>
                    <p className="leading-relaxed text-blue-800">
                      {result.generalAdvice}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-500 space-y-2">
                <p className="text-base font-semibold text-slate-700">Chưa tìm thấy phòng hoàn toàn trùng khớp</p>
                <p className="text-xs">Hãy thử mở rộng ngân sách hoặc thay đổi khu vực tìm kiếm để AI gợi ý nhiều lựa chọn hơn.</p>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            Hệ thống gợi ý thông minh thời gian thực
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
