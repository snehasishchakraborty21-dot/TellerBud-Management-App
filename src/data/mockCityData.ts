export interface City {
  cityId: string;
  cityName: string;
  province?: string;
  isActive: boolean;
  permittedBusinessIds?: string[]; // null or empty array indicates accessible to all agency businesses
}

/**
 * Centralized TellerBud City Master List
 * Strictly alphabetical order of approved Zambian commercial operating cities.
 */
export const CENTRAL_CITY_MASTER_LIST: City[] = [
  { cityId: 'CITY-CHG', cityName: 'Chingola', province: 'Copperbelt', isActive: true },
  { cityId: 'CITY-CHP', cityName: 'Chipata', province: 'Eastern', isActive: true },
  { cityId: 'CITY-KBW', cityName: 'Kabwe', province: 'Central', isActive: true },
  { cityId: 'CITY-KFE', cityName: 'Kafue', province: 'Lusaka', isActive: true },
  { cityId: 'CITY-KSM', cityName: 'Kasama', province: 'Northern', isActive: true },
  { cityId: 'CITY-KTW', cityName: 'Kitwe', province: 'Copperbelt', isActive: true },
  { cityId: 'CITY-LIV', cityName: 'Livingstone', province: 'Southern', isActive: true },
  { cityId: 'CITY-LNS', cityName: 'Luanshya', province: 'Copperbelt', isActive: true },
  { cityId: 'CITY-LUS', cityName: 'Lusaka', province: 'Lusaka', isActive: true },
  { cityId: 'CITY-MZB', cityName: 'Mazabuka', province: 'Southern', isActive: true },
  { cityId: 'CITY-MNG', cityName: 'Mongu', province: 'Western', isActive: true },
  { cityId: 'CITY-MFL', cityName: 'Mufulira', province: 'Copperbelt', isActive: true },
  { cityId: 'CITY-NDL', cityName: 'Ndola', province: 'Copperbelt', isActive: true },
  { cityId: 'CITY-SLW', cityName: 'Solwezi', province: 'North-Western', isActive: true },
];

/**
 * Combines physical address with city name into a unified location line.
 * Prevents repeating the city name if the physical address already includes it.
 *
 * Example:
 * formatStoreLocation('Plot 4821, Cairo Road', 'Lusaka') => 'Plot 4821, Cairo Road, Lusaka'
 * formatStoreLocation('Plot 4821, Cairo Road, Lusaka', 'Lusaka') => 'Plot 4821, Cairo Road, Lusaka'
 */
export function formatStoreLocation(physicalAddress?: string, cityName?: string): string {
  const addr = (physicalAddress || '').trim().replace(/,\s*$/, '');
  const city = (cityName || '').trim();

  if (!addr && !city) return '';
  if (!city) return addr;
  if (!addr) return city;

  // Check if physicalAddress already contains the city name (case-insensitive word boundary)
  const escapedCity = city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const cityRegex = new RegExp(`\\b${escapedCity}\\b`, 'i');

  if (cityRegex.test(addr)) {
    return addr;
  }

  return `${addr}, ${city}`;
}
