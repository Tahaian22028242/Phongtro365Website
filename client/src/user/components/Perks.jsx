import React from 'react';

const PERK_LIST = [
  { id: 'wifi', name: 'Wifi tốc độ cao', icon: '📶' },
  { id: 'parking', name: 'Chỗ gửi xe', icon: '🛵' },
  { id: 'elevator', name: 'Thang máy', icon: '🛗' },
  { id: 'washing', name: 'Máy giặt chung', icon: '🧺' },
  { id: 'pets', name: 'Cho phép thú cưng', icon: '🐾' },
  { id: 'clean', name: 'Dịch vụ dọn vệ sinh', icon: '🧹' },
  { id: 'tv', name: 'Tivi truyền hình', icon: '📺' },
  { id: 'kitchen', name: 'Khu vực bếp', icon: '🍳' },
  { id: 'air_conditioner', name: 'Điều hòa', icon: '❄️' },
  { id: 'water_heater', name: 'Bình nóng lạnh', icon: '🚿' },
];

export default function Perks({ selected = [], onChange }) {
  function handleCbClick(ev) {
    const { checked, name } = ev.target;
    if (checked) {
      onChange([...selected, name]);
    } else {
      onChange(selected.filter(selectedName => selectedName !== name));
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {PERK_LIST.map(perk => {
        const isChecked = selected.includes(perk.id);
        return (
          <label
            key={perk.id}
            className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer select-none text-xs font-semibold ${
              isChecked
                ? 'bg-rose-50 border-rose-500 text-rose-700 shadow-sm'
                : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              name={perk.id}
              onChange={handleCbClick}
              className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
            />
            <span className="text-base">{perk.icon}</span>
            <span className="truncate">{perk.name}</span>
          </label>
        );
      })}
    </div>
  );
}
