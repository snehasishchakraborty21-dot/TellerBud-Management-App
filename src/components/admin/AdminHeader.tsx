import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  X,
  Building2,
} from 'lucide-react';
import { NotificationPanel } from './NotificationPanel';
import { ProfileDropdown } from './ProfileDropdown';
import { AdminNotification, AdminUserProfile } from '../../types/admin';
import { useAuth } from '../../context/AuthContext';
import {
  SUPER_ADMIN_NAVIGATION_CONFIG,
  BUSINESS_OWNER_NAVIGATION_CONFIG,
} from '../../config/navigation';

interface AdminHeaderProps {
  pageTitle: string;
  onToggleMobileSidebar: () => void;
  onToggleDesktopCollapse?: () => void;
  isDesktopCollapsed?: boolean;
  notifications: AdminNotification[];
  profile?: AdminUserProfile;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onGlobalSearch?: (query: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  pageTitle,
  onToggleMobileSidebar,
  notifications,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onGlobalSearch,
}) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<string | null>(null);
  const accountTriggerRef = React.useRef<HTMLButtonElement>(null);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    const config =
      currentUser?.role === 'business_owner'
        ? BUSINESS_OWNER_NAVIGATION_CONFIG
        : SUPER_ADMIN_NAVIGATION_CONFIG;

    const results: { id: string; label: string; path: string; groupTitle: string }[] = [];
    config.forEach((group) => {
      group.items.forEach((item) => {
        if (
          item.label.toLowerCase().includes(q) ||
          group.title.toLowerCase().includes(q)
        ) {
          results.push({
            id: item.id,
            label: item.label,
            path: item.path,
            groupTitle: group.title,
          });
        }
      });
    });
    return results;
  }, [searchQuery, currentUser?.role]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsSearchDropdownOpen(true);
    if (onGlobalSearch) {
      onGlobalSearch(val);
    }
  };

  const handleProfileDropdownAction = (action: 'profile' | 'signout') => {
    if (action === 'profile') {
      setShowFeedbackModal(
        `${currentUser?.roleLabel || 'User'} profile settings. Managed through TellerBud Security Portal.`
      );
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 flex-shrink-0">
        {/* Left Side: Menu Trigger & Page Heading */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 text-gray-500 hover:text-[#102025] hover:bg-gray-100 rounded-lg transition-colors focus-visible:ring-1 focus-visible:ring-[#0D93AA]"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-lg sm:text-xl font-bold text-[#102025] truncate">
            {pageTitle}
          </h1>
        </div>

        {/* Global Top-Centre Application Label */}
        <div className="hidden lg:flex items-center justify-center flex-1 px-4 text-center">
          <span className="text-xs xl:text-sm font-semibold text-gray-700 tracking-wide select-none">
            {currentUser?.role === 'super_admin' ? 'TellerBud Admin Web Application' : 'TellerBud Management Web Application'}
          </span>
        </div>

        {/* Right Side: Global Search, Notifications, Profile */}
        <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
          {/* Global Search Pill Input */}
          <div className="relative hidden md:block w-56 lg:w-64">
            <Search
              size={15}
              className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsSearchDropdownOpen(true)}
              onBlur={() => setTimeout(() => setIsSearchDropdownOpen(false), 200)}
              placeholder="Search operations..."
              className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs sm:text-sm placeholder-gray-400 text-[#102025] focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchDropdownOpen(false);
                  if (onGlobalSearch) onGlobalSearch('');
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}

            {isSearchDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden py-1 max-h-64 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        navigate(res.path);
                        setIsSearchDropdownOpen(false);
                        setSearchQuery('');
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-gray-50 flex items-center justify-between text-xs transition-colors cursor-pointer"
                    >
                      <span className="font-semibold text-gray-900">{res.label}</span>
                      <span className="text-[10px] text-gray-400 font-medium">{res.groupTitle}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3.5 py-2.5 text-xs text-gray-500 text-center">
                    No matching sections found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen((prev) => !prev);
                setIsProfileOpen(false);
              }}
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-colors focus:outline-none focus:ring-1 focus:ring-[#0D93AA] cursor-pointer"
              aria-label="Notifications"
              aria-expanded={isNotificationsOpen}
            >
              <Bell size={20} />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm leading-none">
                  {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            <NotificationPanel
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              notifications={notifications}
              onMarkAsRead={onMarkNotificationRead}
              onMarkAllAsRead={onMarkAllNotificationsRead}
            />
          </div>

          {/* User Profile Area with Left Divider */}
          <div className="relative flex items-center border-l pl-3 sm:pl-6 border-gray-200">
            <button
              ref={accountTriggerRef}
              onClick={() => {
                setIsProfileOpen((prev) => !prev);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D93AA] rounded-xl p-1 cursor-pointer transition-all"
              aria-expanded={isProfileOpen}
              aria-haspopup="true"
              aria-label="User account menu"
            >
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-[#102025] leading-none">
                  {currentUser?.fullName || 'Sililo Lubinda'}
                </div>
                <div className="text-[10px] text-[#0D93AA] font-semibold mt-1 leading-none flex items-center justify-end gap-1">
                  <span>{currentUser?.roleLabel || (currentUser?.role === 'super_admin' ? 'TellerBud Admin' : 'Business Owner')}</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#0D93AA]/10 border border-[#0D93AA]/20 text-[#0D93AA] font-bold flex items-center justify-center text-xs flex-shrink-0 group-hover:bg-[#0D93AA]/20 transition-colors">
                {currentUser?.initials || 'SL'}
              </div>
            </button>

            <ProfileDropdown
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              onSelectAction={handleProfileDropdownAction}
              triggerRef={accountTriggerRef}
            />
          </div>
        </div>
      </header>

      {/* Action modal feedback (client review) */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl p-5 max-w-sm w-full shadow-lg border border-gray-100">
            <p className="text-sm font-bold text-[#102025] mb-2">Security Notice</p>
            <p className="text-xs text-gray-600 mb-4">{showFeedbackModal}</p>
            <button
              onClick={() => setShowFeedbackModal(null)}
              className="w-full py-2 bg-[#0D93AA] hover:bg-[#0D788B] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </>
  );
};
