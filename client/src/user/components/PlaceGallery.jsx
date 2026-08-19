import React, { useState } from 'react';
import { BASE_URL } from '../../config';

function PlaceGallery({ place }) {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const photos = place?.photos && place.photos.length > 0
    ? place.photos
    : [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000' }];

  const getImgSrc = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000';
    return url.startsWith('http') ? url : BASE_URL + url;
  };

  const openFullscreen = (index) => {
    setSelectedPhotoIndex(index);
    setShowAllPhotos(true);
  };

  return (
    <div className="relative mt-4">
      {/* Photo Grid */}
      {photos.length === 1 ? (
        <div 
          onClick={() => openFullscreen(0)}
          className="cursor-pointer rounded-2xl overflow-hidden aspect-[16/9] max-h-[440px] bg-slate-100 group"
        >
          <img
            src={getImgSrc(photos[0]?.url)}
            alt="Room main"
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          />
        </div>
      ) : photos.length === 2 ? (
        <div className="grid grid-cols-2 gap-3 rounded-2xl overflow-hidden aspect-[16/9] max-h-[440px]">
          {photos.slice(0, 2).map((photo, i) => (
            <div
              key={i}
              onClick={() => openFullscreen(i)}
              className="cursor-pointer overflow-hidden bg-slate-100 group h-full"
            >
              <img
                src={getImgSrc(photo?.url)}
                alt={`Room ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 rounded-3xl overflow-hidden max-h-[460px]">
          {/* Main Large Photo */}
          <div
            onClick={() => openFullscreen(0)}
            className="md:col-span-2 cursor-pointer overflow-hidden bg-slate-100 group relative aspect-[4/3] md:aspect-auto h-full min-h-[300px]"
          >
            <img
              src={getImgSrc(photos[0]?.url)}
              alt="Main photo"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Secondary Photos */}
          <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-3 h-full">
            {photos.slice(1, 5).map((photo, index) => (
              <div
                key={index + 1}
                onClick={() => openFullscreen(index + 1)}
                className="cursor-pointer overflow-hidden bg-slate-100 group relative aspect-[4/3]"
              >
                <img
                  src={getImgSrc(photo?.url)}
                  alt={`Room ${index + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Button to show all photos */}
      {photos.length > 1 && (
        <button
          type="button"
          onClick={() => openFullscreen(0)}
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-slate-800 text-xs font-semibold px-4 py-2 rounded-xl shadow-md backdrop-blur-md flex items-center gap-2 border border-slate-200/80 transition-all cursor-pointer hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-4 h-4 text-rose-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          Xem tất cả ({photos.length} ảnh)
        </button>
      )}

      {/* Fullscreen Photo Modal */}
      {showAllPhotos && (
        <div
          className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col justify-between p-4 sm:p-6 text-white"
          onClick={() => setShowAllPhotos(false)}
        >
          {/* Header */}
          <div className="flex items-center justify-between max-w-6xl w-full mx-auto" onClick={(e) => e.stopPropagation()}>
            <span className="text-sm font-medium text-slate-300">
              Ảnh {selectedPhotoIndex + 1} / {photos.length}
            </span>
            <button
              type="button"
              onClick={() => setShowAllPhotos(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Large Image */}
          <div
            className="flex-1 flex items-center justify-center max-w-5xl mx-auto my-4 relative w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {photos.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedPhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
                className="absolute left-0 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all cursor-pointer z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}

            <img
              src={getImgSrc(photos[selectedPhotoIndex]?.url)}
              alt={`Full view ${selectedPhotoIndex + 1}`}
              className="max-h-[70vh] max-w-full object-contain rounded-2xl shadow-2xl"
            />

            {photos.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedPhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
                className="absolute right-0 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all cursor-pointer z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {photos.length > 1 && (
            <div
              className="flex items-center justify-center gap-2 overflow-x-auto py-2 max-w-4xl mx-auto scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((photo, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(i)}
                  className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 transition-all cursor-pointer border-2 ${
                    i === selectedPhotoIndex ? 'border-rose-500 scale-105 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                >
                  <img
                    src={getImgSrc(photo?.url)}
                    alt={`thumb ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PlaceGallery;
