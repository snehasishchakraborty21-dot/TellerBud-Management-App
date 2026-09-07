import React from 'react';

interface TellerBudLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showAdminBadge?: boolean;
  collapsed?: boolean;
  subtitle?: string;
}

export const TellerBudLogo: React.FC<TellerBudLogoProps> = ({
  className = '',
  size = 'md',
  showAdminBadge = true,
  collapsed = false,
  subtitle = 'TELLERBUD ADMIN',
}) => {
  const containerSizes = {
    sm: 'w-7 h-7',
    md: 'w-[38px] h-[38px]',
    lg: 'w-11 h-11',
  };

  return (
    <div
      className={`flex items-center select-none ${
        collapsed ? 'justify-center w-full' : 'gap-2.5'
      } ${className}`}
    >
      {/* Official TellerBud Logo Artwork (36–40px, normalized crop) */}
      <div
        className={`${containerSizes[size]} flex items-center justify-center flex-shrink-0 overflow-hidden`}
      >
        <img
          src="/assets/branding/tellerbud-admin-logo.png"
          alt="TellerBud"
          className="w-full h-full object-contain object-center scale-[1.2] select-none"
          loading="eager"
          onError={(e) => {
            const target = e.currentTarget;
            if (!target.src.endsWith('/tellerbud-admin-logo.png')) {
              target.src = '/tellerbud-admin-logo.png';
            }
          }}
        />
      </div>

      {!collapsed && (
        <div className="flex flex-col justify-center min-w-0">
          <span className="font-bold text-[17px] leading-tight tracking-tight text-[#102025]">
            TellerBud
          </span>
          {showAdminBadge && (
            <span className="text-[10px] font-bold tracking-wider text-[#0D93AA] uppercase leading-none mt-0.5 whitespace-nowrap">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};



