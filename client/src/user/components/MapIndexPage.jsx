import React, { useEffect } from 'react';
import { MapContainer, Marker, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';
import { BASE_URL } from '../../config';
import { Link } from 'react-router-dom';

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

function MapIndexPage({ places }) {
  if (!places || places.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-sm">
        Không có dữ liệu phòng để hiển thị bản đồ.
      </div>
    );
  }

  const defaultPosition = [21.030246, 105.840686];
  const firstWithCoords = places.find(p => p.latitude && p.longitude);
  const centerPos = firstWithCoords ? [firstWithCoords.latitude, firstWithCoords.longitude] : defaultPosition;

  const getImgSrc = (url) => {
    if (!url) return 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=200';
    return url.startsWith('http') ? url : BASE_URL + url;
  };

  const formatPrice = (p) => {
    if (!p) return '';
    return p >= 1000000 ? (p / 1000000).toFixed(1).replace('.0', '') + ' triệu' : p + ' triệu';
  };

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-card border border-slate-200">
      <MapContainer
        center={centerPos}
        zoom={13}
        style={{ height: '100%', width: '100%', minHeight: '480px' }}
      >
        <Geocoder />
        {places.map((place) =>
          place.latitude && place.longitude ? (
            <Marker key={place.id} position={[place.latitude, place.longitude]}>
              <Tooltip direction="top" offset={[-3, -10]} opacity={1} interactive={true}>
                <div className="p-1 max-w-[160px] text-center font-sans">
                  <img
                    src={getImgSrc(place.photos?.[0]?.url)}
                    alt={place.title}
                    className="w-full h-20 object-cover rounded-lg mb-1.5"
                  />
                  <Link
                    to={`/place/${place.id}`}
                    className="font-semibold text-xs text-slate-900 hover:text-rose-600 line-clamp-1 block text-left"
                  >
                    {place.title}
                  </Link>
                  <p className="text-xs font-bold text-rose-600 text-left mt-0.5">
                    {formatPrice(place.price)}/tháng
                  </p>
                </div>
              </Tooltip>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
}

export default MapIndexPage;
