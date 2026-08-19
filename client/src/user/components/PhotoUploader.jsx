import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../config';

function PhotoUploader({ addedPhotos, setAddedPhotos }) {
  const [photoLink, setPhotoLink] = useState('');
  const [uploading, setUploading] = useState(false);

  async function addPhotoByLink(ev) {
    ev.preventDefault();
    if (!photoLink.trim()) return;
    try {
      const { data: filename } = await axios.post('/post/upload-by-link', { link: photoLink });
      setAddedPhotos(prev => [...prev, filename]);
      setPhotoLink('');
    } catch (e) {
      console.error(e);
      alert('Không thể tải ảnh qua URL. Hãy thử tải trực tiếp từ máy.');
    }
  }

  function uploadPhoto(ev) {
    const files = ev.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append('photos', files[i]);
    }
    axios.post('/post/upload', data, {
      headers: { 'Content-type': 'multipart/form-data' }
    }).then(response => {
      const { data: filenames } = response;
      if (filenames) {
        setAddedPhotos(prev => [...prev, ...filenames]);
      }
    }).catch(err => {
      console.error(err);
      alert('Tải ảnh thất bại.');
    }).finally(() => {
      setUploading(false);
    });
  }

  function removePhoto(ev, filename) {
    ev.preventDefault();
    setAddedPhotos([...addedPhotos.filter(photo => photo !== filename)]);
  }

  function selectAsMainPhoto(ev, filename) {
    ev.preventDefault();
    const addedPhotosWithoutSelected = addedPhotos.filter(photo => photo !== filename);
    setAddedPhotos([filename, ...addedPhotosWithoutSelected]);
  }

  const getImgSrc = (link) => {
    if (!link) return '';
    return link.startsWith('http') ? link : BASE_URL + link;
  };

  return (
    <div className="space-y-4">
      {/* URL Upload Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          value={photoLink}
          onChange={ev => setPhotoLink(ev.target.value)}
          placeholder="Dán link ảnh trực tuyến (vd: https://images.unsplash.com/...)"
          className="text-xs"
        />
        <button
          type="button"
          onClick={addPhotoByLink}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex-shrink-0 cursor-pointer"
        >
          Thêm link
        </button>
      </div>

      {/* Grid of uploaded images + upload button */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {addedPhotos.length > 0 && addedPhotos.map((link, idx) => {
          const isMain = idx === 0;
          return (
            <div className="h-32 relative rounded-2xl overflow-hidden group shadow-sm bg-slate-100 border border-slate-200" key={link}>
              <img
                className="w-full h-full object-cover"
                src={getImgSrc(link)}
                alt="Uploaded"
              />

              {/* Badges and action buttons */}
              {isMain && (
                <div className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                  Ảnh bìa chính
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2">
                <button
                  type="button"
                  onClick={(ev) => selectAsMainPhoto(ev, link)}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isMain ? 'bg-amber-400 text-slate-950' : 'bg-white/80 hover:bg-white text-slate-800'
                  }`}
                  title="Đặt làm ảnh bìa"
                >
                  ⭐
                </button>
                <button
                  type="button"
                  onClick={(ev) => removePhoto(ev, link)}
                  className="p-1.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-lg transition-all cursor-pointer"
                  title="Xóa ảnh này"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}

        {/* Upload Button */}
        <label className="h-32 cursor-pointer flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-300 hover:border-rose-500 rounded-2xl p-3 bg-slate-50 hover:bg-rose-50/20 text-slate-500 hover:text-rose-600 transition-all">
          <input type="file" multiple accept="image/*" className="hidden" onChange={uploadPhoto} />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="text-xs font-semibold">
            {uploading ? "Đang tải..." : "Tải ảnh từ máy"}
          </span>
        </label>
      </div>
    </div>
  );
}

export default PhotoUploader;
