import React from 'react';
import { ApprovedVendor } from '../../types/admin';

export interface VendorConfig {
  name: string;
  assetPath: string;
  alt: string;
}

/**
 * Central Vendor Logo Mapping using official brand assets from /assets/vendors/
 */
export const VENDOR_LOGO_MAP: Record<ApprovedVendor, VendorConfig> = {
  MTN: {
    name: 'MTN',
    assetPath: '/assets/vendors/mtn.svg',
    alt: 'MTN Zambia',
  },
  Airtel: {
    name: 'Airtel',
    assetPath: '/assets/vendors/airtel.svg',
    alt: 'Airtel Zambia',
  },
  Zamtel: {
    name: 'Zamtel',
    assetPath: '/assets/vendors/zamtel.svg',
    alt: 'Zamtel',
  },
  Zanaco: {
    name: 'Zanaco',
    assetPath: '/assets/vendors/zanaco.svg',
    alt: 'Zanaco Bank',
  },
  FNB: {
    name: 'FNB',
    assetPath: '/assets/vendors/fnb.svg',
    alt: 'FNB Zambia',
  },
  INDO: {
    name: 'INDO',
    assetPath: '/assets/vendors/indo.svg',
    alt: 'Indo Zambia Bank',
  },
  Stanbic: {
    name: 'Stanbic',
    assetPath: '/assets/vendors/stanbic.svg',
    alt: 'Stanbic Bank',
  },
  Access: {
    name: 'Access',
    assetPath: '/assets/vendors/access.svg',
    alt: 'Access Bank',
  },
};

interface VendorLogoProps {
  vendor: ApprovedVendor;
  size?: 'sm' | 'md' | 'lg' | 'table' | 'detail';
  showName?: boolean;
  className?: string;
}

export const VendorLogo: React.FC<VendorLogoProps> = ({
  vendor,
  size = 'table',
  showName = true,
  className = '',
}) => {
  const vendorConfig = VENDOR_LOGO_MAP[vendor] || {
    name: vendor,
    assetPath: `/assets/vendors/${String(vendor).toLowerCase()}.svg`,
    alt: `${vendor} logo`,
  };

  // Table artwork: ~30-34px; Summary and Full Details: ~34-40px
  const sizeMap: Record<string, string> = {
    sm: 'w-[32px] h-[32px]',
    table: 'w-[32px] h-[32px]',
    md: 'w-[36px] h-[36px]',
    detail: 'w-[36px] h-[36px]',
    lg: 'w-[40px] h-[40px]',
  };

  const imageDimensions = sizeMap[size] || sizeMap.table;

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`${imageDimensions} shrink-0 flex items-center justify-center bg-transparent`}>
        <img
          src={vendorConfig.assetPath}
          alt={vendorConfig.alt}
          className="w-full h-full object-contain object-center select-none"
          loading="lazy"
        />
      </div>
      {showName && (
        <span className="text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">
          {vendorConfig.name}
        </span>
      )}
    </div>
  );
};

