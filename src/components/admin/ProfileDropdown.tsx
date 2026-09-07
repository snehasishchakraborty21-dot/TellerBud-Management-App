import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { User, LogOut, Shield, ChevronRight, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction?: (action: 'profile' | 'signout') => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  onSelectAction,
  triggerRef,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [coords, setCoords] = useState<{
    top: number;
    right: number;
    width: number;
  }>({
    top: 70,
    right: 16,
    width: 300,
  });

  // Calculate and update position with automatic collision detection
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!triggerRef?.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;

      // Menu width: 280px to 320px, responsive on narrow viewports
      const targetWidth = 300;
      const width = Math.min(targetWidth, screenWidth - 24);

      // Directly below trigger by default (8px gap)
      let top = rect.bottom + 8;

      // Right-aligned with trigger
      let right = screenWidth - rect.right;

      // Edge collision detection - right edge
      if (right < 12) {
        right = 12;
      }

      // Edge collision detection - left edge
      if (screenWidth - right - width < 12) {
        right = Math.max(12, screenWidth - width - 12);
      }

      // Vertical collision detection
      const estimatedHeight = 240;
      const spaceBelow = screenHeight - top;
      if (spaceBelow < estimatedHeight && rect.top > estimatedHeight) {
        // Position above trigger if below has insufficient room
        top = Math.max(12, rect.top - estimatedHeight - 8);
      }

      setCoords({
        top,
        right,
        width,
      });
    };

    updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, triggerRef]);

  // Click outside and escape handling
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        (!triggerRef?.current || !triggerRef.current.contains(target))
      ) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        triggerRef?.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen || !currentUser) return null;

  const handleSignOut = () => {
    onClose();
    if (onSelectAction) {
      onSelectAction('signout');
    }
    logout();
    navigate('/login', { replace: true });
  };

  const handleProfileClick = () => {
    onClose();
    if (currentUser.role === 'business_owner') {
      navigate('/business-owner/business-profile');
    }
    if (onSelectAction) {
      onSelectAction('profile');
    }
  };

  const dropdownContent = (
    <div
      ref={dropdownRef}
      id="account-profile-dropdown"
      className="fixed bg-white border border-gray-100 rounded-2xl shadow-xl z-[99999] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: `${coords.top}px`,
        right: `${coords.right}px`,
        width: `${coords.width}px`,
      }}
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="user-account-trigger"
    >
      {/* Profile Overview Card Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50/60">
        <div className="flex items-start gap-3">
          {/* User Avatar or Initials */}
          <div className="w-11 h-11 rounded-full bg-[#0D93AA]/10 border border-[#0D93AA]/25 text-[#0D93AA] font-bold flex items-center justify-center text-sm shrink-0">
            {currentUser.initials || 'CM'}
          </div>

          {/* User Identity Details */}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-[#102025] leading-snug">
              {currentUser.fullName || 'Chileshe Mwamba'}
            </p>
            {currentUser.email && (
              <p className="text-xs text-gray-500 break-all leading-tight mt-0.5">
                {currentUser.email}
              </p>
            )}

            {/* Role Badge */}
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0D93AA] bg-white px-2 py-0.5 rounded-md border border-[#0D93AA]/20 shadow-2xs">
                <Shield size={11} className="shrink-0" />
                {currentUser.roleLabel || (currentUser.role === 'super_admin' ? 'TellerBud Admin' : 'Business Owner')}
              </span>
            </div>
          </div>
        </div>

        {/* Business Affiliation (Lusaka Central Express Agency) - Business Owner only */}
        {currentUser.role === 'business_owner' && (
          <div className="mt-3 pt-2.5 border-t border-gray-200/60 flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gray-200/60 flex items-center justify-center shrink-0 text-gray-500">
              <Building2 size={12} />
            </div>
            <p className="text-xs font-medium text-gray-700 leading-snug">
              {currentUser.businessName || 'Lusaka Central Express Agency'}
            </p>
          </div>
        )}
      </div>

      {/* Menu Actions */}
      <div className="p-2 space-y-1">
        <button
          id="btn-profile-settings"
          onClick={handleProfileClick}
          className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-[#102025] hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:ring-2 focus-visible:ring-[#0D93AA] focus-visible:outline-none rounded-xl transition-colors text-left cursor-pointer"
          role="menuitem"
        >
          <span className="flex items-center gap-2.5">
            <User size={15} className="text-[#0D93AA]" />
            Profile Settings
          </span>
          <ChevronRight size={14} className="text-gray-400" />
        </button>

        <div className="my-1 border-t border-gray-100" />

        <button
          id="btn-profile-signout"
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 focus-visible:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none rounded-xl transition-colors text-left cursor-pointer"
          role="menuitem"
        >
          <LogOut size={15} className="text-red-500" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return createPortal(dropdownContent, document.body);
};
