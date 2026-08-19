import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../components/UserContext';
import axios from 'axios';
import { BASE_URL } from '../../config';
import AccountNav from '../components/AccountNav';

function ProfilePage() {
  const { ready, user, setUser } = useContext(UserContext);
  const [showAvatarPopup, setShowAvatarPopup] = useState(false);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [updatedAvatar, setUpdatedAvatar] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [updatedInfo, setUpdatedInfo] = useState({
    name: '',
    phone: '',
    zalo: '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [checkToHide, setCheckToHide] = useState(false);
  const [deleteLog, setDeleteLog] = useState('');
  const [reason, setReason] = useState(null);

  useEffect(() => {
    if (user) {
      setUpdatedInfo({
        name: user.name || '',
        phone: user.phone || '',
        zalo: user.zalo || '',
      });
    }
  }, [user]);

  function uploadPhoto(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    const data = new FormData();
    data.append('photos', file);
    axios.post('/post/upload', data, {
      headers: { 'Content-type': 'multipart/form-data' }
    }).then(response => {
      const { data: filenames } = response;
      if (filenames && filenames[0]) {
        setUpdatedAvatar(filenames[0]);
      }
    }).catch(err => {
      console.error(err);
      alert('Không thể tải ảnh lên. Vui lòng thử lại.');
    }).finally(() => {
      setUploadingAvatar(false);
    });
  }

  const saveAvatar = async () => {
    if (!updatedAvatar) return;
    try {
      await axios.put('/auth/change-avatar', { id: user.id, updatedAvatar });
      setShowAvatarPopup(false);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('Không thể lưu ảnh đại diện.');
    }
  };

  const handleHideAccount = () => {
    const confirmation = window.confirm("Bạn có chắc muốn thay đổi trạng thái tài khoản không?");
    if (confirmation) {
      axios.post('/auth/hide-account')
        .then((response) => {
          alert(response.data.message || "Đã cập nhật trạng thái tài khoản!");
          window.location.reload();
        })
        .catch((error) => {
          console.error("Lỗi:", error);
          alert("Không thể thay đổi trạng thái tài khoản. Vui lòng thử lại.");
        });
    }
  };

  const handleInfoChange = (e) => {
    const { name, value } = e.target;
    setUpdatedInfo((prev) => ({ ...prev, [name]: value }));
  };

  const saveInfo = async () => {
    try {
      const response = await axios.post('/auth/update-profile', {
        name: updatedInfo.name,
        phone: updatedInfo.phone,
        zalo: updatedInfo.zalo,
      });
      alert(response.data.message || 'Thông tin cá nhân đã được cập nhật thành công!');
      setShowInfoPopup(false);
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin!');
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const savePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert('Mật khẩu mới và xác nhận mật khẩu không khớp!');
      return;
    }
    if (passwords.newPassword.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      const response = await axios.post('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      alert(response.data.message || 'Mật khẩu đã được thay đổi thành công!');
      setShowPasswordPopup(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi thay đổi mật khẩu!');
    }
  };

  const checkHideAccountCondition = async () => {
    try {
      const response = await axios.get('/auth/check-hide-account');
      const { result, reason } = response.data;
      if (result) {
        setCheckToHide(true);
      } else {
        setCheckToHide(false);
        if (reason) setReason(reason);
      }
      setShowStatusPopup(true);
    } catch (error) {
      console.error(error);
      alert('Không thể kiểm tra điều kiện.');
    }
  };

  const checkDeleteAccountCondition = async () => {
    try {
      const response = await axios.get('/auth/check-delete-account');
      const { result } = response.data;
      setDeleteLog(result);
      setShowDeletePopup(true);
    } catch (error) {
      console.error(error);
      alert('Không thể kiểm tra điều kiện xóa tài khoản.');
    }
  };

  const deleteAccount = async () => {
    if (!confirmPassword) {
      alert('Vui lòng nhập mật khẩu để xác nhận.');
      return;
    }
    try {
      const response = await axios.post('/auth/delete-account', {
        password: confirmPassword,
      });
      alert(response.data.message || 'Tài khoản đã được xóa thành công.');
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa tài khoản!');
    }
  };

  const handleClosePopup = (setPopupState) => (e) => {
    if (e.target === e.currentTarget) {
      setPopupState(false);
    }
  };

  if (!ready) {
    return <div className="text-center py-20 text-slate-500 font-medium">Đang tải thông tin...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl p-8 border border-slate-200 space-y-4 max-w-md mx-auto">
        <p className="text-slate-600">Bạn chưa đăng nhập.</p>
        <a href="/login" className="primary inline-flex">Đến trang Đăng nhập</a>
      </div>
    );
  }

  const getAvatarUrl = () => {
    if (user?.avatar) {
      return user.avatar.startsWith('http') ? user.avatar : BASE_URL + user.avatar;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email || 'User')}&background=F43F5E&color=fff&bold=true&size=200`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <AccountNav />

      {user.status === 'DEACTIVATED' && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm font-medium flex items-center gap-3">
          <span>⚠️</span>
          <span>Tài khoản của bạn hiện đang ở trạng thái ẩn. Các bài đăng của bạn sẽ tạm thời không hiển thị cho người khác.</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-card border border-slate-200/80">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-slate-100 pb-8">
          {/* Avatar with edit badge */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-3xl overflow-hidden ring-4 ring-rose-500/10 shadow-md bg-slate-100">
              <img
                src={getAvatarUrl()}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => setShowAvatarPopup(true)}
              className="absolute -bottom-2 -right-2 bg-slate-900 hover:bg-rose-600 text-white p-2.5 rounded-xl shadow-md transition-colors cursor-pointer"
              title="Đổi ảnh đại diện"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </button>
          </div>

          {/* User Basic Info Header */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{user.name || 'Chưa cập nhật tên'}</h1>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <span className={`inline-flex self-center md:self-start items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                user.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                {user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tài khoản ẩn'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2 text-xs text-slate-500">
              <div>
                <span className="font-semibold text-slate-700">Điện thoại:</span> {user.phone || 'Chưa cập nhật'}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Zalo:</span> {user.zalo || 'Chưa cập nhật'}
              </div>
              <div>
                <span className="font-semibold text-slate-700">Vi phạm:</span>{' '}
                <span className={user.violationCount > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                  {user.violationCount || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowInfoPopup(true)}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
              </svg>
              Cập nhật thông tin
            </button>
            <button
              onClick={() => setShowPasswordPopup(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              Đổi mật khẩu
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={user.status === 'DEACTIVATED' ? handleHideAccount : () => checkHideAccountCondition()}
              className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {user.status === 'DEACTIVATED' ? 'Hiện lại tài khoản' : 'Ẩn tài khoản'}
            </button>
            <button
              onClick={() => checkDeleteAccountCondition()}
              className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              Xóa tài khoản
            </button>
          </div>
        </div>
      </div>

      {/* Avatar Popup */}
      {showAvatarPopup && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={handleClosePopup(setShowAvatarPopup)}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900">Thay đổi ảnh đại diện</h2>
            {updatedAvatar ? (
              <div className="w-32 h-32 mx-auto rounded-3xl overflow-hidden ring-2 ring-rose-500">
                <img
                  className="w-full h-full object-cover"
                  src={updatedAvatar.startsWith('http') ? updatedAvatar : BASE_URL + updatedAvatar}
                  alt="Preview"
                />
              </div>
            ) : (
              <label className="h-36 cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-rose-500 rounded-3xl p-4 bg-slate-50 transition-colors">
                <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-xs font-semibold text-slate-600">
                  {uploadingAvatar ? 'Đang tải lên...' : 'Chọn ảnh từ thiết bị'}
                </span>
              </label>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAvatarPopup(false)}
                className="secondary text-xs"
              >
                Hủy
              </button>
              {updatedAvatar && (
                <button
                  onClick={saveAvatar}
                  className="primary text-xs"
                >
                  Lưu thay đổi
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Popup */}
      {showInfoPopup && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={handleClosePopup(setShowInfoPopup)}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900">Cập nhật thông tin cá nhân</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
                <input
                  type="text"
                  name="name"
                  value={updatedInfo.name}
                  onChange={handleInfoChange}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
                <input
                  type="text"
                  name="phone"
                  value={updatedInfo.phone}
                  onChange={handleInfoChange}
                  placeholder="0912345678"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Zalo liên hệ</label>
                <input
                  type="text"
                  name="zalo"
                  value={updatedInfo.zalo}
                  onChange={handleInfoChange}
                  placeholder="0912345678"
                  className="text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShowInfoPopup(false)}
                className="secondary text-xs"
              >
                Hủy
              </button>
              <button
                onClick={saveInfo}
                className="primary text-xs"
              >
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Popup */}
      {showPasswordPopup && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={handleClosePopup(setShowPasswordPopup)}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-slate-900">Thay đổi mật khẩu</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu mới (ít nhất 6 ký tự)</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3">
              <button
                onClick={() => setShowPasswordPopup(false)}
                className="secondary text-xs"
              >
                Hủy
              </button>
              <button
                onClick={savePassword}
                className="primary text-xs"
              >
                Lưu mật khẩu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete / Hide modals */}
      {showDeletePopup && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={handleClosePopup(setShowDeletePopup)}
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-rose-600">Xác nhận xóa tài khoản</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này không? Hành động này không thể khôi phục.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nhập mật khẩu của bạn để xác nhận</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Mật khẩu xác nhận"
                className="text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeletePopup(false)}
                className="secondary text-xs"
              >
                Hủy
              </button>
              <button
                onClick={deleteAccount}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
