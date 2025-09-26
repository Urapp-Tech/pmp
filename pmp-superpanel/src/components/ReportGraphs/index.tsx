import assets from '@/assets/images';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import service from '@/services/adminapp/reports';

// ───────────────────────────────────────────────────────────────────────────────
// Visual constants
// ───────────────────────────────────────────────────────────────────────────────
const BAR_SIZE = 16;
const CARD_BG = '#DFF6EF';
const RAD = Math.PI / 180;

const COLORS = {
  card: '#DFF6EF', // card bg mint
  bg: '#EAFBF5', // page bg mint
  navy: '#242460', // dark bars / text
  mint: '#5EBFA1', // light bars / button mint
  green: '#00A14B', // revenue number
  legendRented: '#5EBFA1', // donut large
  legendVacant: '#242460', // donut small
  peach: '#FFB277', // 31-60 days
  coral: '#FF8CA7', // 61-90 days
  sage: '#5EBFA1', // 91+ days (you can switch to #B7D8B6 if preferred)
};

const tickStyle = {
  fill: COLORS.navy,
  fontSize: 12,
  fontWeight: 600,
  opacity: 0.9,
};

// ───────────────────────────────────────────────────────────────────────────────
// Types for the backend payload
// ───────────────────────────────────────────────────────────────────────────────
type OverviewResp = {
  success: boolean;
  revenue: {
    year: number;
    total_revenue: number;
    currency?: string | null;
    series: { month: string; invoiced: number; collected: number }[];
  };
  recent_payments: {
    items: {
      invoice_id: string;
      paid_amount: number;
      currency?: string | null;
      created_at: string;
      tenant_name?: string | null;
      property_name?: string | null;
      unit_no?: string | null;
    }[];
  };
  unpaid_aging: {
    lookback_days: number;
    total_unpaid: number;
    buckets: { label: '0-30' | '31-60' | '61-90' | '91+'; value: number }[];
  };
  occupancy: {
    total_units: number;
    rented: number;
    vacant: number;
    percent_rented: number;
    percent_vacant: number;
  };
};

// ───────────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────────
const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
] as const;
type MonthCode = (typeof MONTHS)[number];

const seriesToMap = (
  series?: { month: string; invoiced: number; collected: number }[]
) => {
  const base: Record<MonthCode, { invoiced: number; collected: number }> = {
    JAN: { invoiced: 0, collected: 0 },
    FEB: { invoiced: 0, collected: 0 },
    MAR: { invoiced: 0, collected: 0 },
    APR: { invoiced: 0, collected: 0 },
    MAY: { invoiced: 0, collected: 0 },
    JUN: { invoiced: 0, collected: 0 },
    JUL: { invoiced: 0, collected: 0 },
    AUG: { invoiced: 0, collected: 0 },
    SEP: { invoiced: 0, collected: 0 },
    OCT: { invoiced: 0, collected: 0 },
    NOV: { invoiced: 0, collected: 0 },
    DEC: { invoiced: 0, collected: 0 },
  };
  (series ?? []).forEach((s) => {
    const key = s.month as MonthCode;
    if (key in base)
      base[key] = { invoiced: s.invoiced || 0, collected: s.collected || 0 };
  });
  return base;
};

// pretty “x hours ago”
const timeAgo = (iso: string) => {
  const d = new Date(iso);
  const diffSec = Math.max(0, (Date.now() - d.getTime()) / 1000);
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hours ago`;
  const days = Math.floor(hrs / 24);
  return `${days} days ago`;
};

// percentage badges inside donut “bites”
const makeBadge = (onlyFor: string) => (props: any) => {
  const { cx, cy, midAngle, innerRadius, name, percent } = props;
  if (name !== onlyFor) return null;

  const r = innerRadius - 6; // tuck into the hole
  const x = cx + Math.cos(-RAD * midAngle) * r;
  const y = cy + Math.sin(-RAD * midAngle) * r;
  const pct = Math.round((percent || 0) * 100) + '%';

  return (
    <g>
      <circle cx={x} cy={y} r={18} fill={CARD_BG} />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fill: COLORS.mint, fontWeight: 800, fontSize: 12 }}
      >
        {pct}
      </text>
    </g>
  );
};

// ───────────────────────────────────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────────────────────────────────
export default function ReportGraphs() {
  // dynamic years (current and previous 4)
  const YEARS_TOTAL = 5;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: YEARS_TOTAL }, (_, i) => currentYear - i);

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [half, setHalf] = useState<'H1' | 'H2'>('H1'); // Jan–Jun / Jul–Dec

  // API state
  const [overview, setOverview] = useState<OverviewResp | null>(null);
  const [loading, setLoading] = useState(false);

  const currency = overview?.revenue.currency || 'KWD';
  const totalRevenue = overview?.revenue.total_revenue ?? 0;

  // fetch overview from backend
  const fetchReportOverview = async () => {
    try {
      setLoading(true);
      const res = await service.getReportOverview({
        year: selectedYear,
        lookback_days: 150,
        limit: 3,
      });
      setOverview(res.data as OverviewResp);
    } catch {
      // swallow for now
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear]);

  // ── Revenue chart data (mint = full height, navy = normalized collected) ──
  const revenueSeriesMap = useMemo(
    () => seriesToMap(overview?.revenue.series),
    [overview]
  );
  const visibleMonths = half === 'H1' ? MONTHS.slice(0, 6) : MONTHS.slice(6);
  const maxInHalf = Math.max(
    1,
    ...visibleMonths.map((m) => revenueSeriesMap[m].collected || 0)
  );
  const revenueData = visibleMonths.map((m) => ({
    m,
    light: 100, // always full-height mint
    dark: Math.round(((revenueSeriesMap[m].collected || 0) / maxInHalf) * 100), // navy overlap
  }));

  // recent payments list
  const payments = overview?.recent_payments.items ?? [];

  // unpaid aging
  const unpaidBuckets = overview?.unpaid_aging.buckets ?? [];
  const unpaidMax = Math.max(1, ...unpaidBuckets.map((b) => b.value || 0));

  // occupancy donut
  const occRented = overview?.occupancy.percent_rented ?? 0;
  const occVacant = overview?.occupancy.percent_vacant ?? 0;

  return (
    <div
      className="min-h-screen w-full px-6 py-8 md:px-10"
      style={{ background: COLORS.bg }}
    >
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* ─────────────────────── Recent Payments ─────────────────────── */}
        <div className="rounded-3xl">
          <h1
            className="mb-16 text-[36px] font-semibold leading-[1.05]"
            style={{ color: COLORS.navy }}
          >
            Reports
            <br />
            Overview
          </h1>

          <div className="rounded-2xl bg-bodyTable p-6">
            <div
              className="mb-2 text-sm font-bold"
              style={{ color: COLORS.navy }}
            >
              Recent Payments
            </div>
            <div className="h-[2px] w-full bg-dialogBg" />

            <ul className="mt-4 space-y-4">
              {(payments.length ? payments : []).map((p) => (
                <li key={p.invoice_id} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg">
                    <img
                      src={assets.images.repIconLogo}
                      className="h-7 w-7 object-contain"
                    />
                  </div>
                  <div>
                    <div
                      className="font-semibold"
                      style={{ color: COLORS.navy }}
                    >
                      {p.tenant_name || 'Unknown Payer'}
                    </div>
                    <div
                      className="text-xs opacity-70"
                      style={{ color: COLORS.navy }}
                    >
                      {timeAgo(p.created_at)}
                      {p.property_name ? ` | ${p.property_name}` : ''}
                      {p.unit_no ? ` - ${p.unit_no}` : ''}
                    </div>
                  </div>
                </li>
              ))}
              {!payments.length && !loading && (
                <li className="text-sm text-[#657080]">No recent payments.</li>
              )}
            </ul>
          </div>
        </div>

        {/* ─────────────────────── Total Revenue ───────────────────────── */}
        <div className="rounded-3xl bg-bodyTable p-6 shadow-sm md:p-7">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div
                className="text-sm font-semibold"
                style={{ color: COLORS.navy }}
              >
                Total Revenue
              </div>
              <div className="mt-2 text-2xl font-extrabold">
                <span style={{ color: COLORS.green }}>
                  {Number(totalRevenue || 0).toLocaleString()}
                </span>{' '}
                <span className="font-bold" style={{ color: COLORS.green }}>
                  {currency}
                </span>
              </div>
            </div>

            {/* Half toggle + Year select */}
            <div className="flex items-center gap-3">
              <div
                className="flex overflow-hidden rounded-xl border border-[#242460]"
                role="tablist"
                aria-label="Half selector"
              >
                <button
                  role="tab"
                  aria-selected={half === 'H1'}
                  onClick={() => setHalf('H1')}
                  className={`px-4 py-2 text-sm font-semibold ${
                    half === 'H1'
                      ? 'bg-[#5EBFA1]/40 text-[#242460]'
                      : 'bg-transparent text-[#242460]'
                  }`}
                >
                  Jan–Jun
                </button>
                <button
                  role="tab"
                  aria-selected={half === 'H2'}
                  onClick={() => setHalf('H2')}
                  className={`px-4 py-2 text-sm font-semibold ${
                    half === 'H2'
                      ? 'bg-[#5EBFA1]/40 text-[#242460]'
                      : 'bg-transparent text-[#242460]'
                  }`}
                >
                  Jul–Dec
                </button>
              </div>

              <div className="relative">
                <select
                  className="appearance-none rounded-xl border-2 border-primary-bg bg-transparent px-3 pr-10 py-2 text-sm font-semibold text-primary-bg focus:outline-none focus:ring-2 focus:ring-[#A5F2DE]"
                  value={selectedYear}
                  onChange={(e) =>
                    setSelectedYear(parseInt(e.target.value, 10))
                  }
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E2130]/80"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer>
              <BarChart
                data={revenueData}
                barSize={BAR_SIZE}
                barGap={-BAR_SIZE} // overlap mint+navy
                barCategoryGap="55%"
                margin={{ top: 8, right: 6, bottom: 0, left: 0 }}
              >
                <CartesianGrid horizontal={false} vertical={false} />
                <XAxis
                  dataKey="m"
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={tickStyle}
                  axisLine={false}
                  tickLine={{ stroke: 'rgba(31,33,80,0.35)' }}
                  tickSize={0}
                  width={30}
                  domain={[0, 120]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                />
                {/* Draw mint first (tall, background) then navy over it */}
                <Bar
                  dataKey="light"
                  radius={[12, 12, 12, 12]}
                  fill={COLORS.mint}
                />
                <Bar
                  dataKey="dark"
                  radius={[12, 12, 12, 12]}
                  fill={COLORS.navy}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─────────────────────── Occupancy Rate ──────────────────────── */}
        <div className="rounded-3xl bg-bodyTable p-6 shadow-sm md:p-7">
          <div
            className="mb-2 text-sm font-semibold"
            style={{ color: COLORS.navy }}
          >
            Occupancy Rate
          </div>

          <div className="flex items-center justify-center gap-6">
            <div className="h-[260px] w-[260px]">
              <ResponsiveContainer>
                <PieChart>
                  {/* Base donut (RENTED arc + transparent gap) */}
                  <Pie
                    data={[
                      { name: 'RENTED', value: Math.round(occRented) },
                      {
                        name: '_GAP',
                        value: Math.max(0, 100 - Math.round(occRented)),
                      },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={3}
                    cornerRadius={12}
                    stroke="transparent"
                    labelLine={false}
                    label={makeBadge('RENTED')}
                    isAnimationActive={false}
                  >
                    <Cell fill={COLORS.legendRented} />
                    <Cell fill="transparent" />
                  </Pie>

                  {/* Overlay donut (VACANT a little thicker) */}
                  <Pie
                    data={[
                      { name: '_SPACER', value: Math.round(occRented) },
                      { name: 'VACANT', value: Math.round(occVacant) },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={116}
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={3}
                    cornerRadius={12}
                    stroke="transparent"
                    labelLine={false}
                    label={makeBadge('VACANT')}
                    isAnimationActive={false}
                  >
                    <Cell fill="transparent" />
                    <Cell fill={COLORS.legendVacant} />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: COLORS.legendRented }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: COLORS.navy }}
              >
                RENTED
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ background: COLORS.legendVacant }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: COLORS.navy }}
              >
                VACANT
              </span>
            </div>
          </div>
        </div>

        {/* ─────────────────────── Unpaid Rent ─────────────────────────── */}
        <div className="rounded-3xl bg-bodyTable p-6 shadow-sm md:p-7">
          <div
            className="mb-2 text-sm font-semibold"
            style={{ color: COLORS.navy }}
          >
            Unpaid Rent
          </div>
          <div className="mb-3 text-2xl font-extrabold">
            <span style={{ color: COLORS.green }}>
              {(overview?.unpaid_aging.total_unpaid ?? 0).toLocaleString()}
            </span>{' '}
            <span className="font-bold" style={{ color: COLORS.green }}>
              {currency}
            </span>
          </div>

          <div className="mt-8 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-6">
            {(unpaidBuckets ?? []).map((row) => (
              <React.Fragment key={row.label}>
                <div
                  className="text-xs font-semibold"
                  style={{ color: COLORS.navy }}
                >
                  {row.label} Days
                </div>
                <div className="h-6 w-full rounded-full bg-white/70">
                  <div
                    className="h-6 rounded-full"
                    style={{
                      width: `${(row.value / unpaidMax) * 100}%`,
                      background:
                        row.label === '0-30'
                          ? COLORS.navy
                          : row.label === '31-60'
                            ? COLORS.peach
                            : row.label === '61-90'
                              ? COLORS.coral
                              : COLORS.sage,
                    }}
                  />
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Static axis like your mock; swap to dynamic if you want */}
          <div
            className="mt-6 flex justify-between text-[11px] font-semibold"
            style={{ color: COLORS.navy }}
          >
            <span>0</span>
            <span>100K</span>
            <span>200K</span>
            <span>300K</span>
            <span>400K</span>
            <span>500K</span>
            <span>600K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
