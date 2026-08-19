import React, { useState } from 'react';
import { BASE_URL } from '../../config';
import PlaceFav from './PlaceFav';

function PlaceImg({ place, className = null }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const photos = place?.photos && place.photos.length > 0
    ? place.photos
    : [{ url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600' }];

  const handlePrevPhoto = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? photos.length - 1 : prevIndex - 1));
  };

  const handleNextPhoto = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex === photos.length - 1 ? 0 : prevIndex + 1));
  };

  const handleIndicatorClick = (event, index) => {
    event.preventDefault();
    event.stopPropagation();
    setCurrentIndex(index);
  };

  const currentPhotoUrl = photos[currentIndex]?.url;
  const imgSrc = imgError || !currentPhotoUrl
    ? 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600'
    : (currentPhotoUrl.startsWith('http') ? currentPhotoUrl : BASE_URL + currentPhotoUrl);

  const finalClass = className || 'w-full aspect-[4/3] object-cover';

  return (
    <div
      className="relative overflow-hidden group/img select-none bg-slate-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        className={`${finalClass} transition-transform duration-500 group-hover/img:scale-105`}
        src={imgSrc}
        alt={place?.title || 'Phòng trọ'}
        onError={() => setImgError(true)}
        loading="lazy"
      />

      {/* Favorite Heart Button */}
      <div className="absolute top-3 right-3 z-10">
        <PlaceFav place={place} />
      </div>

      {/* Area badge if available */}
      {place?.area && (
        <div className="absolute bottom-3 left-3 z-10 bg-slate-900/75 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-sm">
          {place.area} m²
        </div>
      )}

      {/* Carousel Prev Button */}
      {photos.length > 1 && (
        <button
          type="button"
          onClick={handlePrevPhoto}
          className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-sm flex items-center justify-center transition-all duration-200 focus:outline-none cursor-pointer ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
          }`}
          title="Ảnh trước"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </button>
      )}

      {/* Carousel Next Button */}
      {photos.length > 1 && (
        <button
          type="button"
          onClick={handleNextPhoto}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-sm flex items-center justify-center transition-all duration-200 focus:outline-none cursor-pointer ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
          }`}
          title="Ảnh kế tiếp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      )}

      {/* Dots indicator */}
      {photos.length > 1 && (
        <div className="absolute bottom-3 right-3 z-10 flex space-x-1.5 bg-slate-950/40 backdrop-blur-md py-1 px-2 rounded-full">
          {photos.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => handleIndicatorClick(e, index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
              title={`Ảnh ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PlaceImg;
