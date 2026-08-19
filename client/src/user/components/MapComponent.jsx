import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import { BASE_URL } from '../../config';

const Geocoder = () => {
  const map = useMap();
  useEffect(() => {
    try {
      const geocoder = L.Control.geocoder({
        defaultMarkGeocode: true,
      })
        .on('markgeocode', (e) => {
          const { bbox } = e.geocode;
          const bounds = L.latLngBounds(bbox.getSouthWest(), bbox.getNorthEast());
          map.fitBounds(bounds);
        })
        .addTo(map);

      return () => {
        try {
          map.removeControl(geocoder);
        } catch {}
      };
    } catch {}
  }, [map]);

  useEffect(() => {
    try {
      const googleStreets = L.tileLayer('https://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
      });
      googleStreets.addTo(map);
    } catch {}
  }, [map]);

  return null;
};

const MapComponent = ({ places }) => {
  const [showMap, setShowMap] = useState(false);

  if (!places || places.length === 0) {
    return null;
  }

  const defaultPosition = [21.030246, 105.840686];
  const firstWithCoords = places.find(p => p.latitude && p.longitude);
  const centerPos = firstWithCoords ? [firstWithCoords.latitude, firstWithCoords.longitude] : defaultPosition;

  const getImgSrc = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200';
    return url.startsWith('http') ? url : BASE_URL + url;
  };

  return (
    <div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setShowMap(true);
        }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl shadow-sm transition-all cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-rose-400">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
        Xem trên bản đồ
      </button>

      {showMap && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm z-50 p-4"
          onClick={() => setShowMap(false)}
        >
          <div
            className="bg-white p-5 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-base">Vị trí phòng trọ</h3>
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden flex-1 min-h-[450px]">
              <MapContainer
                center={centerPos}
                zoom={14}
                style={{ height: '450px', width: '100%' }}
              >
                <Geocoder />
                {places.map((place) =>
                  place.latitude && place.longitude ? (
                    <Marker key={place.id} position={[place.latitude, place.longitude]}>
                      <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={true}>
                        <div className="w-40 text-center font-sans p-1">
                          <img
                            src={getImgSrc(place.photos?.[0]?.url)}
                            alt={place.title}
                            className="w-full h-20 object-cover rounded-md mb-1"
                          />
                          <p className="font-bold text-xs text-slate-800 line-clamp-2">
                            {place.title}
                          </p>
                          <p className="text-xs font-semibold text-rose-600 mt-0.5">
                            {place.price >= 1000000 ? (place.price / 1000000).toFixed(1) + ' tr' : place.price + ' tr'}/tháng
                          </p>
                        </div>
                      </Tooltip>
                    </Marker>
                  ) : null
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
