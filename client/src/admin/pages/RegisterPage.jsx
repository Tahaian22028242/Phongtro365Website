import React, { useState } from 'react';
import axios from 'axios';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  async function registerAdmin(ev) {
    ev.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await axios.post('/admin-api/register', { email, password }, { withCredentials: true });

      if (response.status === 201) {
        setSuccess('Tạo tài khoản quản trị viên mới thành công!');
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error || 'Đã xảy ra lỗi không xác định.');
      } else {
        setError('Không thể kết nối tới server.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-card space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Thêm Quản trị viên mới</h1>
          <p className="text-xs text-slate-500">
            Cấp quyền quản trị viên cho nhân sự mới để cùng quản lý hệ thống.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-2xl text-center font-medium">
            {success}
          </div>
        )}

        <form className="space-y-4" onSubmit={registerAdmin}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email quản trị</label>
            <input
              type="email"
              placeholder="newadmin@phongtro365.vn"
              value={email}
              onChange={(ev) => setEmail(ev.target.value)}
              required
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mật khẩu ban đầu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              required
              className="text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="primary w-full py-3 text-sm font-bold shadow-md cursor-pointer mt-2"
          >
            {loading ? "Đang xử lý..." : "Tạo tài khoản Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
