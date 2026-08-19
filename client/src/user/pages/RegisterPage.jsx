import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: '', email: '', password: '' });

  const isPasswordValid = password.length >= 6;

  const handleInputChange = (field, value) => {
    if (field === 'name') setName(value);
    if (field === 'email') setEmail(value);
    if (field === 'password') setPassword(value);
    setErrors((prev) => ({ ...prev, [field]: '', general: '' }));
  };

  async function registerUser(ev) {
    ev.preventDefault();
    setErrorMessage('');
    setErrors({ name: '', email: '', password: '' });

    let isValid = true;
    const newErrors = { name: '', email: '', password: '' };

    if (!name.trim()) {
      newErrors.name = 'Họ và tên không được để trống!';
      isValid = false;
    }
    if (!email.trim()) {
      newErrors.email = 'Email không được để trống!';
      isValid = false;
    }
    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống!';
      isValid = false;
    } else if (!isPasswordValid) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự!';
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await axios.post('/auth/register', { name, email, password });
      setRedirect(true);
    } catch (error) {
      if (error.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (redirect) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-card border border-slate-200/80">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.75} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.765Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Tạo tài khoản mới</h1>
          <p className="text-sm text-slate-500 mt-1">Đăng ký để tìm và đăng tin phòng trọ dễ dàng</p>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={registerUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(ev) => handleInputChange('name', ev.target.value)}
              className={errors.name ? 'border-rose-300 ring-1 ring-rose-300' : ''}
            />
            {errors.name && <span className="text-rose-500 text-xs mt-1 block">{errors.name}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Địa chỉ Email
            </label>
            <input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(ev) => handleInputChange('email', ev.target.value)}
              className={errors.email ? 'border-rose-300 ring-1 ring-rose-300' : ''}
            />
            {errors.email && <span className="text-rose-500 text-xs mt-1 block">{errors.email}</span>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(ev) => handleInputChange('password', ev.target.value)}
                className={`pr-10 ${errors.password ? 'border-rose-300 ring-1 ring-rose-300' : ''}`}
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

            {/* Password strength indicator */}
            {password.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                <span className={`w-2 h-2 rounded-full ${isPasswordValid ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                <span className={isPasswordValid ? 'text-emerald-600 font-medium' : 'text-rose-500'}>
                  {isPasswordValid ? 'Mật khẩu hợp lệ' : 'Mật khẩu cần ít nhất 6 ký tự'}
                </span>
              </div>
            )}
            {errors.password && <span className="text-rose-500 text-xs mt-1 block">{errors.password}</span>}
          </div>

          <button
            type="submit"
            disabled={loading || (password.length > 0 && !isPasswordValid)}
            className="primary w-full mt-2"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 mt-6">
          Đã có tài khoản?{' '}
          <Link className="font-semibold text-rose-600 hover:text-rose-700 underline" to="/login">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
