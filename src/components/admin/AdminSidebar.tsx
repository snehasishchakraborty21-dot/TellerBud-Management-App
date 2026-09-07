import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { getNavigationConfigForRole, NavGroup, NavItem } from '../../config/navigation';
import { TellerBudLogo } from '../shared/TellerBudLogo';
import { adminService } from '../../services/mockAdminService';
import { chatService } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isDesktopCollapsed?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  isDesktopCollapsed = false,
}) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const [pendingWithdrawalsBadge, setPendingWithdrawalsBadge] = useState<number>(9);
  const [pendingCashFloatBadge, setPendingCashFloatBadge] = useState<number>(5);
  const [chatsBadge, setChatsBadge] = useState<number>(() => chatService.getUnreadConversationsCount());

  const navigationConfig = getNavigationConfigForRole(currentUser?.role);

  // State to track which navigation groups are expanded (all expanded by default)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    navigationConfig.forEach((g) => {
      initial[g.id] = true;
    });
    return initial;
  });

  // Re-initialize expanded groups if role changes
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    navigationConfig.forEach((g) => {
      initial[g.id] = true;
    });
    setExpandedGroups(initial);
  }, [currentUser?.role]);

  useEffect(() => {
    const updateBadges = async () => {
      if (currentUser?.role === 'business_owner') {
        const cfSummary = await adminService.getCashFloatStatusSummary(currentUser.businessName);
        setPendingCashFloatBadge(cfSummary.pendingReview);
      } else {
        const wSummary = await adminService.getWithdrawalStatusSummary();
        setPendingWithdrawalsBadge(wSummary.pendingReview);

        const cfSummary = await adminService.getCashFloatStatusSummary();
        setPendingCashFloatBadge(cfSummary.pendingReview);
      }
    };

    updateBadges();
    const unsubscribe = adminService.subscribe(updateBadges);
    return () => unsubscribe();
  }, [currentUser?.role, currentUser?.businessName]);

  // Sync Chats unread badge
  useEffect(() => {
    const updateChatBadge = () => {
      setChatsBadge(chatService.getUnreadConversationsCount());
    };
    updateChatBadge();
    const unsubscribeChat = chatService.subscribe(updateChatBadge);
    return () => unsubscribeChat();
  }, []);

  // Handle closing drawer on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const renderNavGroup = (group: NavGroup, index: number) => {
    const isExpanded = !!expandedGroups[group.id];

    return (
      <div key={group.id} className={index === 0 ? 'mt-1' : 'mt-4'}>
        {/* Group Header Button */}
        {!isDesktopCollapsed && (
          <button
            type="button"
            onClick={() => toggleGroup(group.id)}
            className="w-full flex items-center justify-between px-3 py-1 text-[13px] font-bold text-[#111827] leading-[18px] tracking-normal mb-2 hover:text-[#0D93AA] transition-colors cursor-pointer rounded-md"
            aria-expanded={isExpanded}
          >
            <span className="truncate">{group.title}</span>
            {isExpanded ? (
              <ChevronDown size={15} className="text-[#111827] flex-shrink-0 ml-2" />
            ) : (
              <ChevronRight size={15} className="text-[#111827] flex-shrink-0 ml-2" />
            )}
          </button>
        )}

        {/* Group Items */}
        {(isExpanded || isDesktopCollapsed) && (
          <nav className="space-y-[3px]">
            {group.items.map((item: NavItem) => {
              const Icon = item.icon;
              const isDashboard = item.id === 'dashboard-home';
              const isActive =
                location.pathname === item.path ||
                (!isDashboard && location.pathname.startsWith(item.path + '/')) ||
                (item.id === 'business-profile' &&
                  (location.pathname === '/business-owner/business-profile' ||
                   location.pathname === '/business-owner/people/business-profile')) ||
                ((item.id === 'agent-cash-float-requests' || item.id === 'cash-float-requests') &&
                  location.pathname.includes('/cash-float-requests')) ||
                ((item.id === 'agent-to-agent-liquidity' || item.id === 'agent-liquidity') &&
                  location.pathname.includes('/agent-to-agent-liquidity'));

              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={isDashboard}
                  onClick={() => {
                    if (isMobileOpen) {
                      onCloseMobile();
                    }
                  }}
                  className={`group flex items-center justify-between px-3 h-[35px] rounded-lg text-[13px] transition-colors ${
                    isActive
                      ? 'bg-[#0D93AA]/10 text-[#0D93AA] font-semibold'
                      : 'text-[#334155] hover:bg-gray-50/80 hover:text-[#111827] font-medium'
                  } ${isDesktopCollapsed ? 'justify-center px-2 h-9' : ''}`}
                  title={item.label}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      size={16}
                      className={`flex-shrink-0 transition-colors ${
                        isActive ? 'text-[#0D93AA]' : 'text-slate-500 group-hover:text-slate-700'
                      }`}
                    />
                    {!isDesktopCollapsed && (
                      <span className="leading-tight text-left truncate">{item.label}</span>
                    )}
                  </div>

                  {!isDesktopCollapsed && (
                    item.badge !== undefined ||
                    item.id === 'customer-withdrawals' ||
                    item.id === 'agent-cash-float-requests' ||
                    item.id === 'cash-float-requests' ||
                    (item.id === 'chats' && chatsBadge > 0)
                  ) && (
                    <span
                      className={`ml-auto pl-2.5 min-w-[20px] h-[18px] px-1.5 inline-flex items-center justify-center text-[10px] font-bold rounded-full flex-shrink-0 leading-none ${
                        isActive
                          ? 'bg-[#0D93AA] text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {item.id === 'customer-withdrawals'
                        ? pendingWithdrawalsBadge
                        : item.id === 'agent-cash-float-requests' || item.id === 'cash-float-requests'
                        ? pendingCashFloatBadge
                        : item.id === 'chats'
                        ? chatsBadge
                        : item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <div className="h-full flex flex-col min-h-0 bg-white border-r border-gray-100 select-none overflow-hidden">
      {/* Top Brand Area */}
      <div
        className={`h-14 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-white ${
          isDesktopCollapsed ? 'px-2 justify-center' : 'px-4'
        }`}
      >
        <TellerBudLogo
          size="md"
          showAdminBadge={!isDesktopCollapsed}
          collapsed={isDesktopCollapsed}
          subtitle={currentUser?.role === 'business_owner' ? 'BUSINESS OWNER' : 'TELLERBUD ADMIN'}
        />
        {/* Mobile Close Button */}
        {isMobileOpen && (
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-gray-500 hover:text-[#102025] hover:bg-gray-100 rounded-md cursor-pointer"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pt-3.5 pb-4 custom-sidebar-scroll">
        {navigationConfig.map((group, index) => renderNavGroup(group, index))}
      </div>

      {/* Footer info: Country & Environment mode indicator */}
      {!isDesktopCollapsed && (
        <div className="py-2.5 px-3.5 border-t border-gray-100 bg-[#F8FAFB] flex-shrink-0">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-gray-600 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D93AA] flex-shrink-0" />
            <span>Zambia (ZM) · ZMW Mode</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen h-[100dvh] sticky top-0 flex-shrink-0 z-40 transition-all duration-200 ${
          isDesktopCollapsed ? 'w-20' : 'w-[272px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer container */}
          <div
            className="relative flex-1 flex flex-col max-w-[275px] w-full bg-white h-full h-[100dvh] shadow-xl z-10 animate-in slide-in-from-left duration-200 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile Navigation"
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
