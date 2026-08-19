import React, { useState, useEffect } from "react";
import { Range } from "react-range";

const formatPrice = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '0 đ';
  if (val >= 1000000) {
    return (val / 1000000).toFixed(1).replace('.0', '') + ' triệu';
  } else if (val >= 1000) {
    return val.toLocaleString('vi-VN') + ' đ';
  } else {
    return val.toLocaleString('vi-VN') + ' triệu';
  }
};

const PriceRangeSelector = ({ minPrice, maxPrice, onChange }) => {
  const safeMin = typeof minPrice === 'number' && !isNaN(minPrice) ? minPrice : 0;
  const safeMax = typeof maxPrice === 'number' && !isNaN(maxPrice) && maxPrice > safeMin ? maxPrice : safeMin + 10;
  const [values, setValues] = useState([safeMin, safeMax]);

  useEffect(() => {
    setValues([safeMin, safeMax]);
  }, [safeMin, safeMax]);

  const handleRangeChange = (newValues) => {
    setValues(newValues);
    if (onChange) {
      onChange(newValues);
    }
  };

  const delta = safeMax - safeMin > 0 ? safeMax - safeMin : 1;
  const leftPct = Math.max(0, Math.min(100, ((values[0] - safeMin) / delta) * 100));
  const rightPct = Math.max(0, Math.min(100, ((values[1] - safeMin) / delta) * 100));

  return (
    <div className="w-full flex flex-col justify-center px-3 py-1">
      <div className="flex justify-between items-center w-full text-xs font-semibold text-slate-700 mb-2.5">
        <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-800 border border-slate-200/60">
          {formatPrice(values[0])}
        </span>
        <span className="text-slate-400 font-normal">đến</span>
        <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-800 border border-slate-200/60">
          {formatPrice(values[1])}
        </span>
      </div>

      <Range
        step={safeMax > 1000 ? 100000 : 0.1}
        min={safeMin}
        max={safeMax}
        values={values}
        onChange={handleRangeChange}
        renderTrack={({ props, children, key }) => (
          <div
            key={key}
            {...props}
            className="w-full h-2 bg-slate-200 rounded-full cursor-pointer relative"
            style={{
              ...props.style,
              background: `linear-gradient(to right, #e2e8f0 ${leftPct}%, #e11d48 ${leftPct}%, #e11d48 ${rightPct}%, #e2e8f0 ${rightPct}%)`,
            }}
          >
            {children}
          </div>
        )}
        renderThumb={({ props, key, isDragged }) => (
          <div
            key={key}
            {...props}
            className={`w-4 h-4 rounded-full bg-white border-2 border-rose-600 shadow-md focus:outline-none cursor-grab active:cursor-grabbing transition-transform ${
              isDragged ? 'scale-125 ring-2 ring-rose-500/30' : 'hover:scale-110'
            }`}
          />
        )}
      />
    </div>
  );
};

export default PriceRangeSelector;
