import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
                  <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
                </svg>
              </div>
              <span className="font-display font-bold text-xl text-white">
                phongtro<span className="text-rose-500">365</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Kênh thông tin phòng trọ, nhà trọ và căn hộ mini hàng đầu Việt Nam. Giúp người thuê tìm phòng nhanh chóng, an toàn và minh bạch.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <span className="inline-flex items-center gap-1.5 text-xs bg-slate-800 text-emerald-400 px-2.5 py-1 rounded-full border border-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                Hệ thống hoạt động 24/7
              </span>
            </div>
          </div>

          {/* Col 2: Khu vực nổi bật */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4 tracking-wide uppercase">Khu vực phổ biến</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#hanoi" className="hover:text-white transition-colors">Phòng trọ Cầu Giấy, Hà Nội</a></li>
              <li><a href="#hanoi" className="hover:text-white transition-colors">Phòng trọ Đống Đa, Hà Nội</a></li>
              <li><a href="#hanoi" className="hover:text-white transition-colors">Phòng trọ Thanh Xuân, Hà Nội</a></li>
              <li><a href="#hcm" className="hover:text-white transition-colors">Căn hộ mini Quận 1, TP.HCM</a></li>
              <li><a href="#hcm" className="hover:text-white transition-colors">Phòng trọ Bình Thạnh, TP.HCM</a></li>
            </ul>
          </div>

          {/* Col 3: Hướng dẫn & Quy định */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4 tracking-wide uppercase">Thông tin hữu ích</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#guide" className="hover:text-white transition-colors">Quy trình thuê phòng an toàn</a></li>
              <li><a href="#rules" className="hover:text-white transition-colors">Quy định và điều khoản đăng tin</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Bảng giá dịch vụ dành cho chủ trọ</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Câu hỏi thường gặp (FAQ)</a></li>
              <li><a href="#security" className="hover:text-white transition-colors">Chính sách bảo mật thông tin</a></li>
            </ul>
          </div>

          {/* Col 4: Liên hệ & Hỗ trợ */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4 tracking-wide uppercase">Hỗ trợ khách hàng</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-rose-400 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Hotline tư vấn</p>
                  <p className="font-semibold text-white">1900 6868 (8:00 - 21:00)</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-rose-400 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Email hỗ trợ</p>
                  <p className="font-semibold text-white">hotro@phongtro365.vn</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Phongtro365. Bản quyền thuộc về Phongtro365 Co., Ltd.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Bảo mật</span>
            <span className="hover:text-slate-400 cursor-pointer">Điều khoản</span>
            <span className="hover:text-slate-400 cursor-pointer">Sơ đồ trang</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
