import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import PlaceImg from "../components/PlaceImg";
import AccountNav from "../components/AccountNav";

const FavouritePage = () => {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavouritePlaces = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/post/favourites");
        setPlaces(response.data || []);
      } catch (error) {
        console.error("Error fetching favourite places", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavouritePlaces();
  }, []);

  const formatPrice = (p) => {
    if (!p) return '0 đ';
    const num = Number(p);
    return num >= 1000000 ? (num / 1000000).toFixed(1).replace('.0', '') + ' triệu' : num + ' triệu';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <AccountNav />

      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-card flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Danh sách phòng yêu thích</h1>
          <p className="text-xs text-slate-500 mt-1">
            Đã lưu <strong className="text-slate-800">{places.length}</strong> phòng trọ bạn quan tâm.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-3 border border-slate-200 animate-pulse space-y-3">
              <div className="aspect-[4/3] bg-slate-200 rounded-2xl"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto text-xl">
            ❤️
          </div>
          <h3 className="font-bold text-slate-800 text-base">Bạn chưa lưu phòng trọ nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Bấm vào biểu tượng trái tim trên các bài đăng để lưu lại danh sách các phòng bạn ưng ý nhất.
          </p>
          <Link to="/" className="primary text-xs inline-flex mt-2">
            Khám phá phòng trọ ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {places.map(place => (
            <Link
              key={place.id}
              to={'/place/' + place.id}
              className="bg-white rounded-3xl p-3 border border-slate-200/80 hover:border-slate-300 shadow-card hover:shadow-card-hover transition-all flex flex-col group"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 relative">
                <PlaceImg place={place} />
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-base font-extrabold text-rose-600">
                      {formatPrice(place.price)}
                      <span className="text-xs text-slate-500 font-normal">/th</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {place.area || 25} m²
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-2 truncate group-hover:text-rose-600 transition-colors">
                    {place.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 flex-shrink-0 text-slate-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    {place.address}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavouritePage;
