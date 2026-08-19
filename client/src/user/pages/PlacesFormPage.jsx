import React, { useEffect, useState } from 'react';
import PhotoUploader from '../components/PhotoUploader';
import Perks from '../components/Perks';
import axios from 'axios';
import LocationPicker from '../components/LocationPicker';
import { Navigate, useParams, Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import AccountNav from '../components/AccountNav';

function PlacesFormPage() {
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [description, setDescription] = useState('');
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState('');
  const [area, setArea] = useState(30);
  const [duration, setDuration] = useState(6);
  const [price, setPrice] = useState(2.5);
  const [redirect, setRedirect] = useState(false);
  const [saving, setSaving] = useState(false);

  // Errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!id) return;
    axios.get('/post/place/' + id).then(response => {
      let { data } = response;
      data = data.place;
      setTitle(data.title || '');
      setAddress(data.address || '');
      setLatitude(data.latitude || null);
      setLongitude(data.longitude || null);
      const photos = data.photos?.map(photoGet => photoGet.url) || [];
      setAddedPhotos(photos);
      setDescription(data.description || '');
      const p = data.perks?.map(perkGet => perkGet.perk) || [];
      setPerks(p);
      setExtraInfo(data.extraInfo || '');
      setArea(data.area || 30);
      setDuration(data.duration || 6);
      setPrice(data.price || 2.5);
    });
  }, [id]);

  function validateForm() {
    const errs = {};
    if (!title.trim()) errs.title = 'Vui lòng nhập tiêu đề bài đăng';
    if (!address.trim()) errs.address = 'Vui lòng nhập địa chỉ cụ thể';
    if (addedPhotos.length < 1) errs.photos = 'Vui lòng thêm ít nhất 1 hình ảnh phòng trọ';
    if (!description.trim()) errs.description = 'Vui lòng nhập mô tả chi tiết phòng trọ';
    if (!area || Number(area) <= 0) errs.area = 'Vui lòng nhập diện tích hợp lệ (> 0 m²)';
    if (!duration || Number(duration) <= 0) errs.duration = 'Vui lòng nhập thời hạn hợp đồng';
    if (!price || Number(price) <= 0) errs.price = 'Vui lòng nhập giá thuê hợp lệ';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function savePlace(ev) {
    ev.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);
    const placeData = {
      title,
      address,
      latitude,
      longitude,
      addedPhotos,
      description,
      perks,
      extraInfo,
      area: Number(area),
      duration: Number(duration),
      price: Number(price)
    };

    try {
      if (id) {
        await axios.put('/post/places/' + id, { id, ...placeData });
      } else {
        await axios.post('/post/places', placeData);
      }
      setRedirect(true);
    } catch (e) {
      console.error(e);
      alert('Không thể lưu phòng trọ. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  if (redirect) return <Navigate to={'/account/places'} />;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <AccountNav />

      {/* Header bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {id ? 'Chỉnh sửa phòng trọ' : 'Đăng tin cho thuê phòng mới'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cung cấp thông tin đầy đủ, rõ ràng và hình ảnh thực tế để thu hút người thuê nhanh chóng.
          </p>
        </div>
        <Link
          to="/account/places"
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors self-start sm:self-auto"
        >
          ← Quay lại danh sách
        </Link>
      </div>

      <form onSubmit={savePlace} className="space-y-6">
        {/* Section 1: Basic Info */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">1. Thông tin cơ bản</h2>
            <p className="text-xs text-slate-500">Tiêu đề hấp dẫn và địa chỉ chính xác giúp tin đăng nổi bật.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tiêu đề bài đăng <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={ev => {
                setTitle(ev.target.value);
                if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
              }}
              placeholder="VD: Phòng trọ khép kín full nội thất gần ĐHQGHN Cầu Giấy"
              className={errors.title ? '!border-rose-500' : ''}
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Địa chỉ chi tiết <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={ev => {
                setAddress(ev.target.value);
                if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
              }}
              placeholder="VD: Số 12 ngõ 45 đường Trần Thái Tông, Dịch Vọng Hậu, Cầu Giấy, Hà Nội"
              className={errors.address ? '!border-rose-500' : ''}
            />
            {errors.address && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.address}</p>}
          </div>
        </div>

        {/* Section 2: Map location */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">2. Vị trí trên bản đồ</h2>
            <p className="text-xs text-slate-500">Bấm trực tiếp lên bản đồ để đánh dấu tọa độ vị trí chính xác.</p>
          </div>

          <LocationPicker
            latitude={latitude}
            longitude={longitude}
            onChange={({ latitude: lat, longitude: lng }) => {
              setLatitude(lat);
              setLongitude(lng);
            }}
          />
        </div>

        {/* Section 3: Photos */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              3. Hình ảnh phòng trọ <span className="text-rose-500">*</span>
            </h2>
            <p className="text-xs text-slate-500">
              Thêm các hình ảnh thực tế phòng ngủ, nhà vệ sinh, ban công, lối đi... (Ảnh đầu tiên sẽ làm ảnh bìa)
            </p>
          </div>

          <PhotoUploader addedPhotos={addedPhotos} setAddedPhotos={setAddedPhotos} />
          {errors.photos && <p className="text-xs text-rose-500 font-medium">{errors.photos}</p>}
        </div>

        {/* Section 4: Description */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              4. Mô tả chi tiết <span className="text-rose-500">*</span>
            </h2>
            <p className="text-xs text-slate-500">Mô tả đặc điểm phòng, trang thiết bị đi kèm, giờ giấc ra vào...</p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <ReactQuill
              theme="snow"
              value={description}
              onChange={val => {
                setDescription(val);
                if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
              }}
              placeholder="Nhập nội dung mô tả chi tiết phòng trọ..."
            />
          </div>
          {errors.description && <p className="text-xs text-rose-500 font-medium">{errors.description}</p>}
        </div>

        {/* Section 5: Perks & Amenities */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">5. Tiện ích & Dịch vụ đi kèm</h2>
            <p className="text-xs text-slate-500">Chọn những tiện ích có sẵn tại phòng để khách dễ tìm kiếm.</p>
          </div>

          <Perks selected={perks} onChange={setPerks} />
        </div>

        {/* Section 6: Extra Info & Notes */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">6. Lưu ý & Quy định bổ sung</h2>
            <p className="text-xs text-slate-500">Giá điện nước, internet, phí dịch vụ hàng tháng hoặc nội quy riêng.</p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-200">
            <ReactQuill
              theme="snow"
              value={extraInfo}
              onChange={setExtraInfo}
              placeholder="VD: Điện 3.5k/số, nước 30k/khối, cọc 1 tháng, đóng tiền ngày mùng 5..."
            />
          </div>
        </div>

        {/* Section 7: Specs & Pricing */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">7. Giá thuê, Diện tích & Hợp đồng</h2>
            <p className="text-xs text-slate-500">Các thông số tài chính chính xác của phòng.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Diện tích phòng (m²) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="5"
                value={area}
                onChange={ev => setArea(ev.target.value)}
                placeholder="VD: 25"
                className={errors.area ? '!border-rose-500' : ''}
              />
              {errors.area && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.area}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Hợp đồng tối thiểu (tháng) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={duration}
                onChange={ev => setDuration(ev.target.value)}
                placeholder="VD: 6"
                className={errors.duration ? '!border-rose-500' : ''}
              />
              {errors.duration && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.duration}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Giá thuê (triệu VND / tháng) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                value={price}
                onChange={ev => setPrice(ev.target.value)}
                placeholder="VD: 3.2"
                className={errors.price ? '!border-rose-500' : ''}
              />
              {errors.price && <p className="text-xs text-rose-500 mt-1 font-medium">{errors.price}</p>}
            </div>
          </div>
        </div>

        {/* Submit button bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/account/places"
            className="secondary text-xs px-6 py-3"
          >
            Hủy bỏ
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="primary text-xs px-8 py-3 font-bold shadow-lg cursor-pointer"
          >
            {saving ? 'Đang lưu bài đăng...' : id ? 'Lưu cập nhật phòng' : 'Đăng tin phòng trọ'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PlacesFormPage;
