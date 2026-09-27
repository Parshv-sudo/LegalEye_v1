import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

interface UserProfileViewProps {
  onOpenMobileSidebar: () => void;
}

export function UserProfileView({ onOpenMobileSidebar }: UserProfileViewProps) {
  const { currentUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile form state (#37)
  const [firstName, setFirstName] = useState(currentUser?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(currentUser?.name?.split(' ')[1] || '');
  const [email, setEmail] = useState(currentUser?.email || `${currentUser?.name?.toLowerCase().replace(' ', '.')}@firm.com`);
  const [bio, setBio] = useState('Specializing in complex civil litigation and IP disputes.');
  const [avatarInitial, setAvatarInitial] = useState(currentUser?.name?.charAt(0) || 'U');
  const [hasCustomAvatar, setHasCustomAvatar] = useState(false);

  // Preferences state (#35, #36)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // File input ref for photo upload (#30)
  const photoInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // #30 Upload Photo handler
  const handleUploadPhoto = () => {
    photoInputRef.current?.click();
  };

  const handlePhotoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarInitial(file.name.charAt(0).toUpperCase());
      setHasCustomAvatar(true);
      showToast(`Photo "${file.name}" selected. (Upload requires backend integration)`);
      e.target.value = '';
    }
  };

  // #31 Remove Photo handler
  const handleRemovePhoto = () => {
    setAvatarInitial(firstName.charAt(0) || 'U');
    setHasCustomAvatar(false);
    showToast('Profile photo removed.');
  };

  // #32 Save Changes handler
  const handleSaveProfile = () => {
    showToast('Profile changes saved to current session.');
  };

  // #33 Change Password handler
  const handleChangePassword = () => {
    showToast('Password change requires backend integration. Contact your administrator.');
  };

  // #34 Enable 2FA handler
  const handleEnable2FA = () => {
    showToast('Two-factor authentication setup requires backend integration.');
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#F8F9FA] min-h-full">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-[#0A192F] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-[16px] text-green-400">check_circle</span>
          {toastMessage}
        </div>
      )}

      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 shrink-0 shadow-sm sticky top-0 z-20">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden w-10 h-10 rounded hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div>
          <h2 className="text-xl font-bold text-[#0A192F]">User Profile</h2>
          <p className="text-xs text-gray-500">Manage your personal information and preferences</p>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-y-auto max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Navigation Sidebar */}
          <div className="col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-3 ${
                activeTab === 'profile'
                  ? 'bg-white shadow-sm text-[#115fd4] border border-gray-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              Personal Info
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-3 ${
                activeTab === 'security'
                  ? 'bg-white shadow-sm text-[#115fd4] border border-gray-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">lock</span>
              Security
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold text-sm transition-all flex items-center gap-3 ${
                activeTab === 'preferences'
                  ? 'bg-white shadow-sm text-[#115fd4] border border-gray-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Preferences
            </button>
          </div>

          {/* Content Area */}
          <div className="col-span-1 md:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-6">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white uppercase shadow-md ${hasCustomAvatar ? 'bg-[#115fd4]' : 'bg-[#1E293B]'}`}>
                    {avatarInitial}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{firstName} {lastName}</h3>
                    <p className="text-gray-500 font-medium">Senior Associate • LegalEye Firm</p>
                    <div className="mt-3 flex gap-3">
                      <button 
                        onClick={handleUploadPhoto}
                        className="px-4 py-1.5 bg-[#115fd4] hover:bg-[#115fd4]/90 text-white text-xs font-semibold rounded transition-colors shadow-sm cursor-pointer"
                      >
                        Upload Photo
                      </button>
                      <input 
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoSelected}
                      />
                      <button 
                        onClick={handleRemovePhoto}
                        className="px-4 py-1.5 border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>

                <div className="px-8 py-6 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                      <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)} 
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:border-[#115fd4] focus:ring-1 focus:ring-[#115fd4] outline-none text-sm bg-gray-50" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                      <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)} 
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:border-[#115fd4] focus:ring-1 focus:ring-[#115fd4] outline-none text-sm bg-gray-50" 
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:border-[#115fd4] focus:ring-1 focus:ring-[#115fd4] outline-none text-sm bg-gray-50" 
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bio / Professional Summary</label>
                      <textarea 
                        rows={4} 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:border-[#115fd4] focus:ring-1 focus:ring-[#115fd4] outline-none text-sm bg-gray-50 resize-none"
                      ></textarea>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button 
                      onClick={handleSaveProfile}
                      className="px-6 py-2 bg-[#0A192F] hover:bg-[#101F38] text-white font-semibold rounded text-sm transition-colors shadow-sm cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Security Settings</h3>
                <p className="text-sm text-gray-600 mb-6">Update your password and secure your account.</p>
                <button 
                  onClick={handleChangePassword}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded transition-colors shadow-sm cursor-pointer"
                >
                  Change Password
                </button>
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account.</p>
                  <button 
                    onClick={handleEnable2FA}
                    className="px-4 py-2 bg-[#2D5A27]/10 border border-[#2D5A27]/20 text-[#2D5A27] hover:bg-[#2D5A27]/20 text-sm font-semibold rounded transition-colors shadow-sm cursor-pointer"
                  >
                    Enable 2FA
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6">App Preferences</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                      <p className="text-xs text-gray-500 mt-1">Receive daily digests of matter updates.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={emailNotifications} 
                      onChange={(e) => { setEmailNotifications(e.target.checked); showToast(`Email notifications ${e.target.checked ? 'enabled' : 'disabled'}. (Saved to session)`); }}
                      className="w-4 h-4 text-[#115fd4] rounded cursor-pointer" 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Dark Mode (Beta)</h4>
                      <p className="text-xs text-gray-500 mt-1">Switch to a dark UI for low-light environments.</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={darkMode}
                      onChange={(e) => { setDarkMode(e.target.checked); showToast(`Dark mode ${e.target.checked ? 'enabled' : 'disabled'}. (Visual theme not yet implemented)`); }}
                      className="w-4 h-4 text-[#115fd4] rounded cursor-pointer" 
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
