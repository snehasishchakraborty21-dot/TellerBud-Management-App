import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Search, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { City } from '../../data/mockCityData';

export interface CityDropdownProps {
  id?: string;
  selectedCityId?: string;
  onSelectCity: (city: City) => void;
  disabled?: boolean;
  error?: string;
  cities: City[];
  isLoading?: boolean;
  loadError?: string | null;
  onRefreshCities?: () => void;
  triggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export const CityDropdown: React.FC<CityDropdownProps> = ({
  id,
  selectedCityId,
  onSelectCity,
  disabled = false,
  error,
  cities,
  isLoading = false,
  loadError = null,
  onRefreshCities,
  triggerRef,
}) => {
  const generatedId = useId();
  const dropdownId = id || `city-dropdown-${generatedId}`;
  const listboxId = `${dropdownId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const internalButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const buttonRef = triggerRef || internalButtonRef;

  // Selected city object
  const selectedCity = cities.find((c) => c.cityId === selectedCityId);

  // Filter cities by search query (matches cityName or province)
  const filteredCities = cities.filter((c) =>
    `${c.cityName} ${c.province || ''}`.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(
        selectedCityId
          ? filteredCities.findIndex((c) => c.cityId === selectedCityId)
          : 0
      );
      // Small timeout to ensure DOM element is ready
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Auto-scroll to highlighted item
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const activeItem = listboxRef.current.children[highlightedIndex] as HTMLElement;
      if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Trigger keyboard navigation
  const handleTriggerKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || loadError) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(true);
    }
  };

  // Listbox/search keyboard navigation
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      buttonRef.current?.focus();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredCities.length > 0) {
        setHighlightedIndex((prev) => (prev + 1) % filteredCities.length);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredCities.length > 0) {
        setHighlightedIndex((prev) => (prev - 1 + filteredCities.length) % filteredCities.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredCities.length) {
        handleSelectCity(filteredCities[highlightedIndex]);
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const handleSelectCity = (city: City) => {
    onSelectCity(city);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
    buttonRef.current?.focus();
  };

  const isInteractiveDisabled = disabled || isLoading || !!loadError;

  return (
    <div className="w-full relative" ref={containerRef}>
      {/* Dropdown Trigger Button */}
      <button
        ref={buttonRef}
        id={dropdownId}
        type="button"
        disabled={isInteractiveDisabled}
        onClick={() => {
          if (!isInteractiveDisabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-invalid={!!error}
        className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition-colors border text-left min-h-[38px] ${
          error
            ? 'border-rose-400 focus:ring-2 focus:ring-rose-500 bg-rose-50/20 text-slate-800'
            : isOpen
            ? 'border-emerald-500 ring-2 ring-emerald-500 bg-white text-slate-900'
            : 'border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white hover:border-slate-400 text-slate-900'
        } ${isInteractiveDisabled ? 'opacity-60 cursor-not-allowed bg-slate-50' : 'cursor-pointer'}`}
      >
        <span className={selectedCity ? 'font-medium text-slate-900' : 'text-slate-400'}>
          {isLoading
            ? 'Loading cities...'
            : loadError
            ? 'Cities unavailable'
            : selectedCity
            ? `${selectedCity.cityName}${selectedCity.province ? ` (${selectedCity.province})` : ''}`
            : 'Select City'}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-fadeIn">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search city..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Options Listbox */}
          <ul
            id={listboxId}
            ref={listboxRef}
            role="listbox"
            tabIndex={-1}
            aria-label="Operating Cities"
            className="max-h-48 overflow-y-auto py-1 divide-y divide-slate-50 text-xs"
          >
            {filteredCities.length === 0 ? (
              <li className="px-3 py-3 text-center text-slate-400 italic">
                {cities.length === 0
                  ? 'No supported cities are currently available.'
                  : `No matching cities found for "${searchQuery}".`}
              </li>
            ) : (
              filteredCities.map((city, index) => {
                const isSelected = city.cityId === selectedCityId;
                const isHighlighted = index === highlightedIndex;

                return (
                  <li
                    key={city.cityId}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectCity(city)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-950 font-semibold'
                        : isHighlighted
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{city.cityName}</span>
                      {city.province && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({city.province})
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* Error / Feedback below field */}
      {error && (
        <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1 animate-fadeIn">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {loadError && (
        <div className="flex items-center justify-between text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded p-1.5 mt-1.5 animate-fadeIn">
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0 text-amber-600" />
            Cities could not be loaded. Please refresh and try again.
          </span>
          {onRefreshCities && (
            <button
              type="button"
              onClick={onRefreshCities}
              className="text-amber-800 font-semibold hover:underline flex items-center gap-0.5 ml-2 shrink-0 cursor-pointer"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              Retry
            </button>
          )}
        </div>
      )}

      {!loadError && cities.length === 0 && !isLoading && (
        <p className="text-[11px] text-amber-600 mt-1 font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>No supported cities are currently available.</span>
        </p>
      )}
    </div>
  );
};
