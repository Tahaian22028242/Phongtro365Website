import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PriceRangeSelector from "../components/PriceRangeSelector";
import MapIndexPage from "../components/MapIndexPage";
import PlaceImg from "../components/PlaceImg";
import PlaceFav from "../components/PlaceFav";
import AiRecommendationModal from "../components/AiRecommendationModal";

function IndexPage() {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [minPrice, setMinPrice] = useState(1500000);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [selectedRange, setSelectedRange] = useState([1500000, 10000000]);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    axios.get("/post/places")
      .then((response) => {
        const { places: fetchedPlaces = [], minPrice: min = 1500000, maxPrice: max = 10000000 } = response.data || {};
        setPlaces(fetchedPlaces);
        const resolvedMin = typeof min === 'number' && !isNaN(min) && min > 0 ? min : 1500000;
        const resolvedMax = typeof max === 'number' && !isNaN(max) && max > resolvedMin ? max : 10000000;
        setMinPrice(resolvedMin);
        setMaxPrice(resolvedMax);
        setSelectedRange([resolvedMin, resolvedMax]);
      })
      .catch((err) => {
        console.error("Error fetching places:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsMapVisible(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const removeDiacritics = (str) => {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  };

  // Popular location chips in Hanoi & HCMC
  const locationTags = [
    { id: "all", label: "Tất cả khu vực" },
    { id: "cau-giay", label: "Cầu Giấy", query: "cầu giấy" },
    { id: "dong-da", label: "Đống Đa", query: "đống đa" },
    { id: "bach-khoa", label: "Hai Bà Trưng", query: "hai bà trưng" },
    { id: "thanh-xuan", label: "Thanh Xuân", query: "thanh xuân" },
    { id: "nam-tu-liem", label: "Nam Từ Liêm", query: "nam từ liêm" },
    { id: "binh-thanh", label: "Bình Thạnh", query: "bình thạnh" },
    { id: "thu-duc", label: "TP. Thủ Đức", query: "thủ đức" },
    { id: "quan-1", label: "Quận 1", query: "quận 1" },
  ];

  // Property room types
  const roomTypes = [
    { id: "all", label: "Tất cả loại phòng", icon: "🏠" },
    { id: "phong-tro", label: "Phòng trọ sinh viên", icon: "🛏️", keyword: "phòng trọ" },
    { id: "chung-cu-mini", label: "Chung cư mini / Studio", icon: "🏢", keyword: "chung cư|studio|căn hộ" },
    { id: "sleepbox", label: "Ký túc xá / Sleepbox", icon: "🎒", keyword: "ký túc xá|sleepbox|ở ghép" },
    { id: "under-3m", label: "Giá rẻ < 3 triệu", icon: "🏷️", max: 3000000 },
  ];

  const handleLocationClick = (tag) => {
    setSelectedCategory(tag.id);
    if (tag.query !== undefined) {
      setSelectedAddress(tag.query);
    } else {
      setSelectedAddress("");
    }
  };

  const handleTypeClick = (type) => {
    setSelectedType(type.id);
    if (type.max !== undefined) {
      setSelectedRange([minPrice, type.max]);
    } else if (type.id === "all") {
      setSelectedRange([minPrice, maxPrice]);
    }
  };

  const filteredPlaces = useMemo(() => {
    const [rangeMin, rangeMax] = selectedRange;
    const searchNormalized = removeDiacritics(selectedAddress.trim());
    const searchTokens = searchNormalized ? searchNormalized.split(/\s+/).filter(Boolean) : [];

    let result = places.filter((place) => {
      // Price filter
      const price = Number(place.price) || 0;
      const withinPrice = price >= rangeMin && price <= rangeMax;
      if (!withinPrice) return false;

      // Room Type filter
      if (selectedType !== "all" && selectedType !== "under-3m") {
        const typeItem = roomTypes.find(t => t.id === selectedType);
        if (typeItem && typeItem.keyword) {
          const keywords = typeItem.keyword.split("|");
          const titleDesc = removeDiacritics((place.title || "") + " " + (place.description || ""));
          const matchesType = keywords.some(kw => titleDesc.includes(removeDiacritics(kw)));
          if (!matchesType) return false;
        }
      }

      // Text / location filter
      if (searchTokens.length === 0) return true;

      const placeAddress = removeDiacritics(place.address || "");
      const placeTitle = removeDiacritics(place.title || "");
      const placeDesc = removeDiacritics(place.description || "");

      return searchTokens.every(
        (token) =>
          placeAddress.includes(token) ||
          placeTitle.includes(token) ||
          placeDesc.includes(token)
      );
    });

    // Sorting
    if (sortBy === "price-asc") {
      result.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === "price-desc") {
      result.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createAt || 0) - new Date(a.createAt || 0));
    }

    return result;
  }, [places, selectedRange, selectedAddress, selectedType, sortBy]);

  const formatPrice = (p) => {
    if (p === undefined || p === null) return "0 đ";
    const num = Number(p);
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(".0", "") + " triệu";
    } else if (num >= 1000) {
      return num.toLocaleString("vi-VN") + " đ";
    } else {
      return num.toLocaleString("vi-VN") + " triệu";
    }
  };

  const handleResetFilters = () => {
    setSelectedAddress("");
    setSelectedRange([minPrice, maxPrice]);
    setSelectedCategory("all");
    setSelectedType("all");
    setSortBy("default");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* AI Recommendation Spotlight Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner shrink-0">
            ✨
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-bold text-lg sm:text-xl tracking-tight">
                AI Recommendation System • Trợ Lý Gợi Ý Phòng Trọ
              </h2>
              <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Gemini 3.7 AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/90 mt-0.5">
              Nhận gợi ý phòng trọ tối ưu theo ngân sách, trường học/công ty và tiện ích cá nhân chỉ trong 3 giây.
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setAiInitialQuery("");
              setAiModalOpen(true);
            }}
            className="w-full sm:w-auto bg-white text-rose-600 hover:bg-slate-50 font-bold px-5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>✨ Thử AI Tìm Phòng Ngay</span>
          </button>
        </div>
      </div>

      {/* Hero Search & Filter Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-card border border-slate-200/80 space-y-5">
        {/* Row 1: Search input + Price selector + Map toggle */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Search bar */}
          <div className="lg:col-span-6 relative flex items-center">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-slate-400 z-10">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Tìm theo quận (Cầu Giấy, Đống Đa...), trường ĐH, tuyến đường..."
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="!pl-11 !pr-10 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border-slate-200 text-slate-900 rounded-2xl text-xs sm:text-sm font-medium transition-all w-full"
            />
            {selectedAddress && (
              <button
                type="button"
                onClick={() => setSelectedAddress("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            )}
          </div>

          {/* Price Range Slider */}
          <div className="lg:col-span-4 bg-slate-50/90 rounded-2xl p-2.5 border border-slate-200/70">
            {minPrice < maxPrice ? (
              <PriceRangeSelector
                minPrice={minPrice}
                maxPrice={maxPrice}
                onChange={setSelectedRange}
              />
            ) : (
              <div className="text-center py-2 text-xs text-slate-500 font-medium">
                Khoảng giá phòng trọ
              </div>
            )}
          </div>

          {/* Map View Switch */}
          <div className="lg:col-span-2 hidden lg:flex justify-end">
            <button
              type="button"
              onClick={() => setIsMapVisible((prev) => !prev)}
              className={`w-full py-3 px-4 rounded-2xl font-bold text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                isMapVisible
                  ? "bg-slate-900 text-white shadow-md"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-rose-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.046 4.84-2.553a1.5 1.5 0 0 0 .807-1.324V4.767a.75.75 0 0 0-1.096-.665L15 6.643l-6-3.158a1.5 1.5 0 0 0-1.408 0L2.748 6.02A.75.75 0 0 0 2.25 6.685v11.87a1.5 1.5 0 0 0 .807 1.324l4.84 2.553a1.5 1.5 0 0 0 1.406 0l5.7-3.003Z" />
              </svg>
              <span>{isMapVisible ? "Đóng bản đồ" : "Xem bản đồ"}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Room Type Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar">
          {roomTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleTypeClick(type)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                selectedType === type.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60"
              }`}
            >
              <span>{type.icon}</span>
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Row 3: Popular Area Chips & Sorting */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px] mr-1 flex-shrink-0">
              Khu vực hot:
            </span>
            {locationTags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleLocationClick(tag)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer font-medium ${
                  selectedCategory === tag.id
                    ? "bg-rose-50 text-rose-600 font-bold border border-rose-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span>Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 py-1.5 px-3 rounded-xl focus:ring-1 focus:ring-rose-500 cursor-pointer w-auto"
            >
              <option value="default">Phù hợp nhất</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
              <option value="newest">Tin mới đăng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Results Listing Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            Danh sách phòng cho thuê
          </h2>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
            {filteredPlaces.length} phòng
          </span>
        </div>

        {(selectedAddress || selectedType !== "all" || sortBy !== "default") && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold cursor-pointer underline flex items-center gap-1"
          >
            ✕ Đặt lại tất cả bộ lọc
          </button>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-3xl overflow-hidden shadow-card border border-slate-200 p-3 animate-pulse space-y-3">
              <div className="aspect-[4/3] bg-slate-200 rounded-2xl"></div>
              <div className="p-2 space-y-2">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-5 bg-slate-200 rounded w-1/3 mt-3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredPlaces.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-card max-w-lg mx-auto my-8 space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl mx-auto flex items-center justify-center text-2xl">
            🔍
          </div>
          <h3 className="font-bold text-base text-slate-900">Không tìm thấy phòng trọ phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Không có kết quả nào khớp với yêu cầu tìm kiếm "{selectedAddress}". Hãy thử chọn khu vực khác hoặc đặt lại khoảng giá.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="primary text-xs inline-flex mx-auto py-2.5 px-6"
            >
              Xóa bộ lọc & Xem tất cả
            </button>
          </div>
        </div>
      ) : (
        /* Property Cards Grid (Split view if Map enabled) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className={`${isMapVisible ? "lg:col-span-7" : "lg:col-span-12"}`}>
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 ${
                isMapVisible ? "lg:grid-cols-2" : "lg:grid-cols-3 xl:grid-cols-4"
              } gap-6`}
            >
              {filteredPlaces.map((place) => (
                <div
                  key={place.id}
                  className="bg-white rounded-3xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group relative"
                >
                  {/* Top Image Preview */}
                  <div className="relative">
                    <PlaceImg place={place} />
                  </div>

                  {/* Card Body */}
                  <Link
                    to={`/place/${place.id}`}
                    className="p-4 flex-1 flex flex-col justify-between focus:outline-none"
                  >
                    <div className="space-y-2">
                      {/* Price row */}
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-lg font-extrabold text-rose-600 font-display">
                            {formatPrice(place.price)}
                          </span>
                          <span className="text-xs text-slate-500 font-normal">/tháng</span>
                        </div>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          HĐ {place.duration || 6}th
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                        {place.title}
                      </h3>

                      {/* Address */}
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs line-clamp-1 pt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400 flex-shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        <span className="truncate">{place.address}</span>
                      </div>

                      {/* Amenities pills */}
                      {place.perks && place.perks.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {place.perks.slice(0, 3).map((perk, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg"
                            >
                              {perk.perk === "wifi" ? "📶 Wifi" : perk.perk === "parking" ? "🛵 Để xe" : perk.perk === "elevator" ? "🛗 Thang máy" : perk.perk === "air_conditioner" ? "❄️ Điều hòa" : perk.perk === "kitchen" ? "🍳 Bếp" : perk.perk}
                            </span>
                          ))}
                          {place.perks.length > 3 && (
                            <span className="text-[10px] text-slate-400 self-center font-semibold">
                              +{place.perks.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Landlord & Action */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {place.owner?.name ? place.owner.name.charAt(0) : 'C'}
                        </div>
                        <span className="text-slate-500 font-medium truncate max-w-[90px]">
                          {place.owner?.name || 'Chủ trọ'}
                        </span>
                      </div>

                      <span className="font-bold text-rose-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        Xem chi tiết →
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Sticky Map in Split Screen */}
          {isMapVisible && (
            <div className="hidden lg:block lg:col-span-5 sticky top-28 h-[calc(100vh-140px)] rounded-3xl overflow-hidden shadow-card border border-slate-200">
              <MapIndexPage places={filteredPlaces} />
            </div>
          )}
        </div>
      )}

      {/* AI Recommendation Modal */}
      <AiRecommendationModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        initialQuery={aiInitialQuery}
      />
    </div>
  );
}

export default IndexPage;
