import React, { useState, useMemo, useRef, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { formatZMW } from '../../utils/formatters';

interface MonthlyRevenueDataPoint {
  month: string;
  shortMonth: string;
  serviceCharges: number;
  commissions: number | null; // null represents coming soon
  hasData: boolean;
}

interface MonthlyRevenueOverviewChartProps {
  year?: number;
  className?: string;
}

export const MonthlyRevenueOverviewChart: React.FC<MonthlyRevenueOverviewChartProps> = ({
  year = 2026,
  className = '',
}) => {
  // Dynamically generate available years from 2026 up through current calendar year (newest first)
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const maxYear = Math.max(2026, currentYear);
    const years: number[] = [];
    for (let y = maxYear; y >= 2026; y--) {
      years.push(y);
    }
    return years;
  }, []);

  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return year && year >= 2026 ? year : 2026;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync if parent date changes
  useEffect(() => {
    if (year && year >= 2026 && year !== selectedYear) {
      setSelectedYear(year);
      setHoveredIndex(null);
    }
  }, [year]);

  // Handle year dropdown change with brief non-disruptive loading state
  const handleYearChange = (newYear: number) => {
    if (newYear === selectedYear) return;
    setHoveredIndex(null);
    setIsLoading(true);
    setSelectedYear(newYear);
    setTimeout(() => {
      setIsLoading(false);
    }, 220);
  };

  // Close tooltip on touch outside
  useEffect(() => {
    const handleTouchOutside = (e: TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setHoveredIndex(null);
      }
    };
    document.addEventListener('touchstart', handleTouchOutside);
    return () => document.removeEventListener('touchstart', handleTouchOutside);
  }, []);

  // 12 months data calculated dynamically for the selected year
  const monthlyData: MonthlyRevenueDataPoint[] = useMemo(() => {
    const monthNames = [
      { month: 'January', shortMonth: 'Jan' },
      { month: 'February', shortMonth: 'Feb' },
      { month: 'March', shortMonth: 'Mar' },
      { month: 'April', shortMonth: 'Apr' },
      { month: 'May', shortMonth: 'May' },
      { month: 'June', shortMonth: 'Jun' },
      { month: 'July', shortMonth: 'Jul' },
      { month: 'August', shortMonth: 'Aug' },
      { month: 'September', shortMonth: 'Sep' },
      { month: 'October', shortMonth: 'Oct' },
      { month: 'November', shortMonth: 'Nov' },
      { month: 'December', shortMonth: 'Dec' },
    ];

    if (selectedYear === 2026) {
      // 2026: Launch year, records through September (month index 8)
      const revenue2026 = [8400, 11250, 13800, 16500, 18200, 21400, 23100, 26750, 24850, 0, 0, 0];
      return monthNames.map((m, idx) => ({
        ...m,
        serviceCharges: revenue2026[idx],
        commissions: null,
        hasData: idx <= 8,
      }));
    } else if (selectedYear < 2026) {
      // No data before 2026
      return monthNames.map((m) => ({
        ...m,
        serviceCharges: 0,
        commissions: null,
        hasData: false,
      }));
    } else {
      // Future/subsequent year
      return monthNames.map((m) => ({
        ...m,
        serviceCharges: 0,
        commissions: null,
        hasData: false,
      }));
    }
  }, [selectedYear]);

  // Chart dimensions in SVG coordinate space
  const svgWidth = 860;
  const svgHeight = 220;
  const padding = { top: 25, right: 30, bottom: 35, left: 65 };
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  // Max value for Y scale
  const maxY = 30000;
  const yTicks = [
    { value: 30000, label: 'ZMW 30K' },
    { value: 20000, label: 'ZMW 20K' },
    { value: 10000, label: 'ZMW 10K' },
    { value: 0, label: 'ZMW 0' },
  ];

  // Map month index to X coordinate
  const getX = (index: number) => {
    return padding.left + (index / (monthlyData.length - 1)) * chartWidth;
  };

  // Map amount to Y coordinate
  const getY = (amount: number) => {
    const clamped = Math.max(0, Math.min(maxY, amount));
    return padding.top + chartHeight - (clamped / maxY) * chartHeight;
  };

  // Calculate discrete hover bands for each month
  const hoverBands = useMemo(() => {
    return monthlyData.map((_, index) => {
      let xStart: number;
      let xEnd: number;

      if (index === 0) {
        xStart = 0;
        xEnd = (getX(0) + getX(1)) / 2;
      } else if (index === monthlyData.length - 1) {
        xStart = (getX(index - 1) + getX(index)) / 2;
        xEnd = svgWidth;
      } else {
        xStart = (getX(index - 1) + getX(index)) / 2;
        xEnd = (getX(index) + getX(index + 1)) / 2;
      }

      return {
        index,
        x: xStart,
        width: xEnd - xStart,
      };
    });
  }, [monthlyData]);

  // Only plot months that have recorded data
  const recordedPoints = useMemo(() => {
    return monthlyData
      .map((d, index) => ({ ...d, index, x: getX(index), y: getY(d.serviceCharges) }))
      .filter((d) => d.hasData);
  }, [monthlyData]);

  // Generate smooth SVG path (Cubic Bezier curves)
  const generateSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

      // Catmull-Rom to Cubic Bezier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = useMemo(() => generateSmoothPath(recordedPoints), [recordedPoints]);

  const areaPath = useMemo(() => {
    if (recordedPoints.length === 0) return '';
    const firstPoint = recordedPoints[0];
    const lastPoint = recordedPoints[recordedPoints.length - 1];
    const baselineY = padding.top + chartHeight;
    return `${linePath} L ${lastPoint.x} ${baselineY} L ${firstPoint.x} ${baselineY} Z`;
  }, [linePath, recordedPoints]);

  const activePoint = hoveredIndex !== null ? monthlyData[hoveredIndex] : null;
  const activeX = hoveredIndex !== null ? getX(hoveredIndex) : 0;
  const activeY = hoveredIndex !== null && activePoint?.hasData ? getY(activePoint.serviceCharges) : getY(0);

  // Determine transform offset for tooltip anchoring so it doesn't clip on edges
  const getTooltipTransformClass = (index: number | null) => {
    if (index === null) return '-translate-x-1/2';
    if (index === 0) return '-translate-x-[12%]';
    if (index === 1) return '-translate-x-[25%]';
    if (index === 11) return '-translate-x-[88%]';
    if (index === 10) return '-translate-x-[75%]';
    return '-translate-x-1/2';
  };

  return (
    <div
      ref={containerRef}
      className={`bg-white border border-gray-100 rounded-xl p-5 sm:p-6 shadow-xs space-y-4 ${className}`}
      style={{ minHeight: '340px' }}
    >
      {/* Header: Title, Year Selector & Legends */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#0D93AA]/10 text-[#0D93AA] flex items-center justify-center shrink-0">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#102025]">Monthly Revenue Overview</h3>
            <p className="text-[11px] text-gray-500 font-medium">
              Comparing service charges and commission trajectories for {selectedYear}
            </p>
          </div>
        </div>

        {/* Right Controls: Year Selector & Legends */}
        <div className="flex flex-wrap items-center gap-3.5 sm:gap-4 text-xs font-semibold">
          {/* Year Selector */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="revenue-year-select" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Year:
            </label>
            <select
              id="revenue-year-select"
              value={selectedYear}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D93AA] focus:bg-white cursor-pointer transition-colors shadow-2xs"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-4 w-px bg-slate-200" />

          {/* Series 1: Service Charges */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 rounded-full bg-[#0D93AA]" />
            <span className="text-slate-700 font-medium">Service Charges</span>
          </div>

          {/* Series 2: Commissions (Coming Soon) */}
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-1 rounded-full bg-indigo-400 border-b border-dashed border-indigo-500" />
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <span>Commissions</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Coming Soon
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div
        className="relative w-full h-[220px] select-none"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {/* Loading Overlay when switching years */}
        {isLoading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/70 backdrop-blur-2xs rounded-lg transition-opacity animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0D93AA]">
              <div className="w-4 h-4 border-2 border-[#0D93AA] border-t-transparent rounded-full animate-spin" />
              <span>Updating revenue data...</span>
            </div>
          </div>
        )}

        {/* Empty State when no recorded data exists for the selected year */}
        {!isLoading && recordedPoints.length === 0 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-4">
            <p className="text-xs font-medium text-slate-500">
              No revenue data available for the selected year.
            </p>
          </div>
        )}

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className={`w-full h-full overflow-visible transition-opacity duration-200 ${
            isLoading ? 'opacity-30' : 'opacity-100'
          }`}
          preserveAspectRatio="none"
        >
          <defs>
            {/* Teal Area Gradient */}
            <linearGradient id="serviceChargesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0D93AA" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0D93AA" stopOpacity="0.0" />
            </linearGradient>

            {/* Subtle glow filter for active point */}
            <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0D93AA" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {yTicks.map((tick, i) => {
            const y = getY(tick.value);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray={tick.value === 0 ? undefined : '4 4'}
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-mono font-medium"
                >
                  {tick.label}
                </text>
              </g>
            );
          })}

          {/* Area Fill for Service Charges */}
          {recordedPoints.length > 0 && <path d={areaPath} fill="url(#serviceChargesGradient)" />}

          {/* Service Charges Smooth Line */}
          {recordedPoints.length > 0 && (
            <path
              d={linePath}
              fill="none"
              stroke="#0D93AA"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Crosshair guide line strictly anchored to the active month */}
          {hoveredIndex !== null && !isLoading && (
            <line
              x1={activeX}
              y1={padding.top}
              x2={activeX}
              y2={padding.top + chartHeight}
              stroke="#0D93AA"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              strokeOpacity="0.6"
            />
          )}

          {/* Data Point Markers for Service Charges */}
          {!isLoading &&
            recordedPoints.map((point) => {
              const isHovered = hoveredIndex === point.index;
              return (
                <g key={point.index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isHovered ? 6 : 4}
                    fill="#FFFFFF"
                    stroke="#0D93AA"
                    strokeWidth={isHovered ? 3 : 2.5}
                    className="transition-all duration-150"
                    filter={isHovered ? 'url(#pointGlow)' : undefined}
                  />
                </g>
              );
            })}

          {/* X-Axis Month Labels */}
          {monthlyData.map((data, index) => {
            const x = getX(index);
            const isHovered = hoveredIndex === index;
            return (
              <g key={index}>
                <text
                  x={x}
                  y={padding.top + chartHeight + 20}
                  textAnchor="middle"
                  className={`text-[11px] font-medium transition-colors pointer-events-none ${
                    isHovered
                      ? 'fill-slate-900 font-bold'
                      : data.hasData
                      ? 'fill-slate-600 font-semibold'
                      : 'fill-slate-300'
                  }`}
                >
                  {data.shortMonth}
                </text>
              </g>
            );
          })}

          {/* Discrete Vertical Month Hover Bands across the full chart height */}
          {!isLoading &&
            hoverBands.map((band) => (
              <rect
                key={band.index}
                x={band.x}
                y={0}
                width={band.width}
                height={svgHeight}
                fill="transparent"
                className="cursor-pointer focus:outline-none"
                tabIndex={0}
                role="button"
                aria-label={`View ${monthlyData[band.index].month} ${selectedYear} revenue`}
                onMouseEnter={() => setHoveredIndex(band.index)}
                onFocus={() => setHoveredIndex(band.index)}
                onBlur={() => setHoveredIndex(null)}
                onClick={() => setHoveredIndex((prev) => (prev === band.index ? null : band.index))}
                onTouchStart={() => setHoveredIndex(band.index)}
              />
            ))}
        </svg>

        {/* Stationary Pop-up Tooltip anchored directly above the active month's data point */}
        {hoveredIndex !== null && activePoint && !isLoading && (
          <div
            className={`absolute z-20 pointer-events-none transform transition-opacity duration-150 ${getTooltipTransformClass(
              hoveredIndex
            )}`}
            style={{
              left: `${(activeX / svgWidth) * 100}%`,
              top: `${Math.max(6, (activeY / svgHeight) * 100 - 38)}%`,
            }}
          >
            <div className="bg-slate-900/95 backdrop-blur-xs text-white px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700/60 text-xs min-w-[195px] space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-700/70 pb-1 text-[11px]">
                <span>
                  {activePoint.month} {selectedYear}
                </span>
                {activePoint.hasData ? (
                  <span className="text-[10px] text-emerald-400 font-mono">Recorded</span>
                ) : (
                  <span className="text-[10px] text-slate-400">Upcoming</span>
                )}
              </div>

              {/* Service Charges Metric */}
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-[#0D93AA]" />
                  <span>Service Charges:</span>
                </div>
                <span className="font-mono font-bold text-teal-300">
                  {activePoint.hasData ? formatZMW(activePoint.serviceCharges) : '—'}
                </span>
              </div>

              {/* Commissions Metric */}
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span>Commissions:</span>
                </div>
                <span className="font-semibold text-indigo-300 text-[10px] bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-700/40">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
