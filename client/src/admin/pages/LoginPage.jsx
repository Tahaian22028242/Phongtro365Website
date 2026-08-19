import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { AdminContext } from "../components/AdminContext";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const { admin, setAdmin } = useContext(AdminContext);

  async function handleLoginSubmit(ev) {
    ev.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await axios.post('/admin-api/login', { email, password }, { withCredentials: true });
      setAdmin(data);
      setRedirect(true);
    } catch (e) {
      if (e.response && e.response.data.error) {
        setError(e.response.data.error);
      } else {
        setError('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (redirect || admin) {
    return <Navigate to="/admin/users" />;
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-rose-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Đăng nhập Admin</h1>
          <p className="text-xs text-slate-500">Dành cho ban quản trị hệ thống Phongtro365</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl text-center font-medium">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLoginSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email quản trị</label>
            <input
              type="email"
              placeholder="admin@phongtro365.vn"
              value={email}
              onChange={ev => setEmail(ev.target.value)}
              required
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={ev => setPassword(ev.target.value)}
              required
              className="text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="primary w-full py-3 text-sm font-bold shadow-md cursor-pointer mt-2"
          >
            {loading ? "Đang xác thực..." : "Đăng nhập hệ thống"}
          </button>
        </form>
      </div>
    </div>
  );
}
