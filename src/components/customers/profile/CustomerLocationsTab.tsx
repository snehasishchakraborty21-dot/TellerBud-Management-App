import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Calendar, Clock, Star } from 'lucide-react';
import { CustomerSavedLocation } from '../../../types/customerProfile';

interface CustomerLocationsTabProps {
  locations: CustomerSavedLocation[];
}

export const CustomerLocationsTab: React.FC<CustomerLocationsTabProps> = ({ locations }) => {
  const [selectedLocationId, setSelectedLocationId] = useState<string>(
    locations[0]?.id || ''
  );

  const activeLoc = locations.find((l) => l.id === selectedLocationId) || locations[0];

  return (
    <div className="space-y-6">
      {/* Locations Header Summary */}
      <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#0D93AA]" />
            Saved Customer Pickup & Delivery Locations ({locations.length})
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Registered geolocations used for automated nearest-agent matching and scheduled pickups
          </p>
        </div>
        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg shrink-0">
          Zambia Coordinate System Active
        </span>
      </div>

      {/* Main Grid: Location Cards & Interactive Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Location Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3.5">
          {locations.map((loc) => {
            const isSelected = loc.id === selectedLocationId;

            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLocationId(loc.id)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white shadow-xs ${
                  isSelected
                    ? 'border-[#0D93AA] ring-2 ring-[#0D93AA]/15 shadow-sm'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        loc.isDefault
                          ? 'bg-[#0D93AA] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{loc.name}</h4>
                      <span className="text-[11px] text-gray-400 font-mono">
                        {loc.coordinates.lat.toFixed(4)}, {loc.coordinates.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {loc.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-[#0D93AA] border border-cyan-200">
                        <Star className="w-3 h-3 fill-current" />
                        Default Location
                      </span>
                    )}
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {loc.source}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600 mb-3 pl-10.5">
                  <p className="font-medium text-gray-800">{loc.street}</p>
                  <p className="text-gray-500">
                    {loc.city}, {loc.province} • <span className="font-semibold text-gray-700">{loc.country}</span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-400 border-t border-gray-100 pt-2.5 pl-10.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Added: {loc.dateAdded}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last used: {loc.lastUsed}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Small Map Preview Container (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-[#0D93AA]" />
              Location Geospatial Preview
            </h4>
            <span className="text-[11px] font-mono text-gray-500">
              {activeLoc?.name}
            </span>
          </div>

          {/* SVG Map Container */}
          <div className="relative w-full h-64 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
            {/* Map Roads & Grid Background SVG */}
            <svg
              className="absolute inset-0 w-full h-full opacity-60 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#CBD5E1" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              {/* Arterial Road Lines */}
              <path
                d="M -50 160 Q 150 140, 450 180"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="7"
                strokeLinecap="round"
              />
              <path
                d="M -50 160 Q 150 140, 450 180"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <path
                d="M 180 -50 Q 190 120, 210 320"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 180 -50 Q 190 120, 210 320"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M 50 300 L 320 20"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="4"
              />
            </svg>

            {/* Pulsating Map Pin Marker in Center */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-[#0D93AA] opacity-70" />
                <div className="relative w-8 h-8 rounded-full bg-[#0D93AA] text-white flex items-center justify-center shadow-lg border-2 border-white">
                  <MapPin className="w-4 h-4 fill-current" />
                </div>
              </div>

              {/* Pin Tooltip */}
              <div className="mt-2 px-3 py-1.5 bg-gray-900/90 backdrop-blur-xs text-white rounded-lg shadow-xl text-center max-w-[220px]">
                <p className="text-xs font-bold leading-tight">{activeLoc?.name}</p>
                <p className="text-[10px] text-gray-300 truncate mt-0.5">{activeLoc?.street}</p>
              </div>
            </div>

            {/* Coordinates Badge */}
            <div className="absolute bottom-2.5 left-2.5 z-20 px-2 py-1 bg-white/90 backdrop-blur-xs rounded-md border border-gray-200 text-[10px] font-mono text-gray-700 shadow-xs">
              Lat: {activeLoc?.coordinates.lat.toFixed(4)} | Lng: {activeLoc?.coordinates.lng.toFixed(4)}
            </div>

            <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 bg-cyan-900/80 text-white rounded text-[10px] font-bold">
              Lusaka Zone A
            </div>
          </div>

          {/* Location Meta Footer */}
          <div className="bg-gray-50 rounded-xl p-3.5 space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Selected Location:</span>
              <span className="font-semibold text-gray-900">{activeLoc?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Full Address:</span>
              <span className="text-gray-800 text-right max-w-[220px] truncate">{activeLoc?.street}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Province & Country:</span>
              <span className="font-medium text-gray-900">{activeLoc?.province}, {activeLoc?.country}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Service Readiness:</span>
              <span className="font-bold text-emerald-700">Eligible for On-Demand Cash Pickup</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
