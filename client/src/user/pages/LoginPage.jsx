import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "../components/UserContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setUser } = useContext(UserContext);
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [blacklistedMessage, setBlacklistedMessage] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "", general: "" });

  async function handleLoginSubmit(ev) {
    ev.preventDefault();

    let isValid = true;
    const newErrors = { email: "", password: "", general: "" };

    if (!email) {
      newErrors.email = "Email không được để trống!";
      isValid = false;
    }
    if (!password) {
      newErrors.password = "Mật khẩu không được để trống!";
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post("/auth/login", { email, password });

      if (data.user?.status === "BLACKLISTED") {
        setIsBlacklisted(true);
        setBlacklistedMessage("Tài khoản của bạn đã bị khóa vĩnh viễn.");
      } else {
        setUser(data.user, data.token);
        window.location.href = "/";
      }
    } catch (error) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 403 && data.status === "BLACKLISTED") {
          setIsBlacklisted(true);
          setBlacklistedMessage(data.error);
        } else {
          setErrors((prev) => ({ ...prev, general: data.error || "Đăng nhập thất bại. Vui lòng kiểm tra lại email hoặc mật khẩu." }));
        }
      } else {
        setErrors((prev) => ({ ...prev, general: "Có lỗi xảy ra khi kết nối máy chủ. Vui lòng thử lại sau." }));
      }
    } finally {
      setLoading(false);
    }
  }

  const fillDemoAccount = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrors({ email: "", password: "", general: "" });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-slate-200/80">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Chào mừng trở lại</h1>
          <p className="text-sm text-slate-500 mt-1">Đăng nhập tài khoản Phongtro365 của bạn</p>
        </div>

        {/* General Error Banner */}
        {errors.general && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <span>{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="tenban@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              className={errors.email ? "border-rose-300 ring-1 ring-rose-300" : ""}
            />
            {errors.email && (
              <span className="text-rose-500 text-xs mt-1 block">{errors.email}</span>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Mật khẩu
              </label>
              <Link to="/forgot-password" className="text-xs text-rose-600 hover:text-rose-700 font-medium">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                className={`pr-10 ${errors.password ? "border-rose-300 ring-1 ring-rose-300" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <span className="text-rose-500 text-xs mt-1 block">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="primary w-full mt-2"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        {/* Quick Demo Login Fillers for easy review */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <p className="text-xs text-center text-slate-400 font-medium mb-3">
            Tài khoản thử nghiệm nhanh:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount("chutro@phongtro365.vn", "123456")}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
            >
              Chủ trọ mẫu
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("admin@phongtro365.vn", "123456")}
              className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors"
            >
              Admin mẫu
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center text-xs text-slate-500 mt-6">
          Bạn chưa có tài khoản?{" "}
          <Link className="font-semibold text-rose-600 hover:text-rose-700 underline" to="/register">
            Đăng ký ngay
          </Link>
        </div>
      </div>

      {/* Blacklist Modal */}
      {isBlacklisted && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-900">Thông báo khóa tài khoản</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{blacklistedMessage}</p>
            <button
              onClick={() => setIsBlacklisted(false)}
              className="primary w-full"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
