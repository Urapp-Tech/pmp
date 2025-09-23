import assets from '@/assets/images';
import { ChevronDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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

const BAR_SIZE = 16;
const CARD_BG = '#DFF6EF';
const RAD = Math.PI / 180;
const BADGE_TEXT = '#242460';

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
  sage: '#5EBFA1', // 91+ days
};

const revenueData = [
  { m: 'JAN', dark: 35, light: 90 },
  { m: 'FEB', dark: 60, light: 110 },
  { m: 'MAR', dark: 70, light: 110 },
  { m: 'APR', dark: 35, light: 110 },
  { m: 'MAY', dark: 80, light: 110 },
  { m: 'JUN', dark: 95, light: 110 },
  { m: 'JUL', dark: 95, light: 110 },
];

const occupancyData = [
  { name: 'RENTED', value: 77 }, // adjust to your real data
  { name: 'VACANT', value: 23 },
];

const unpaidData = [
  { label: '0-30 Days', value: 600000, color: COLORS.navy },
  { label: '31-60 Days', value: 380000, color: COLORS.peach },
  { label: '61-90 Days', value: 260000, color: COLORS.coral },
  { label: '91+ Days', value: 180000, color: COLORS.sage },
];

const payments = [
  { name: 'Khaled Salem', meta: '2 hours ago | 4th aven' },
  { name: 'Fahad Jasem', meta: '2 days ago | ocean aven' },
  { name: 'Abdullah Ahmad', meta: '5 days ago | ocean aven' },
];

const tickStyle = {
  fill: COLORS.navy,
  fontSize: 12,
  fontWeight: 600,
  opacity: 0.9,
};

const makeBadge = (onlyFor: string) => (props: any) => {
  const { cx, cy, midAngle, innerRadius, name, percent } = props;
  if (name !== onlyFor) return null;

  const r = innerRadius - 6; // tuck into the hole to create the “bite”
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
        style={{
          fill: BADGE_TEXT,
          fontWeight: 800,
          fontSize: 12,
        }}
      >
        {pct}
      </text>
    </g>
  );
};

export default function ReportGraphs() {
  const YEARS_TOTAL = 5; // current year + previous 4 (total 5). Change to 6 if you want previous 5 + current.
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: YEARS_TOTAL }, (_, i) => currentYear - i);

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  // const fetchReportOverview = async () => {
  //   try {
  //     const overview = await service.getReportOverview({
  //       year: selectedYear,
  //       lookback_days: 150,
  //       limit: 3,
  //     });
  //     // console.log('users: ', users);

  //     if (overview.data.success) {
  //       setMainIsLoader(false);
  //       setList(users.data.items);
  //       setTotal(users.data.total);
  //     } else {
  //       setMainIsLoader(false);
  //       // console.log('error: ', users.data.message);
  //     }
  //   } catch (error: Error | unknown) {
  //     setMainIsLoader(false);
  //     // console.log('error: ', error);
  //   }
  // };

  // useEffect(() => {}, []);
  return (
    <div
      className="min-h-screen w-full px-6 py-8 md:px-10"
      style={{ background: COLORS.bg }}
    >
      {/* Grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent Payments */}

        <div
          className="rounded-3xl"
          //   style={{ background: COLORS.card }}
        >
          {/* Title */}
          <h1
            className="text-[36px] font-semibold leading-[1.05] mb-16"
            style={{ color: COLORS.navy }}
          >
            Reports
            <br />
            Overview
          </h1>
          <div className="p-6 bg-bodyTable rounded-2xl">
            <div
              className="mb-2 text-sm font-bold"
              style={{ color: COLORS.navy }}
            >
              Recent Payments
            </div>
            <div className="h-[2px] w-full bg-dialogBg" />
            <ul className="mt-4 space-y-4">
              {payments.map((p) => (
                <li key={p.name} className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg font-bold text-white"
                    // style={{ background: COLORS.navy }}
                  >
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
                      {p.name}
                    </div>
                    <div
                      className="text-xs opacity-70"
                      style={{ color: COLORS.navy }}
                    >
                      {p.meta}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="rounded-3xl p-6 md:p-7 shadow-sm bg-bodyTable">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div
                className="text-sm font-semibold"
                style={{ color: COLORS.navy }}
              >
                Total Revenue
              </div>
              <div className="mt-2 text-2xl font-extrabold">
                <span style={{ color: COLORS.green }}>723,836,220</span>{' '}
                <span className="font-bold" style={{ color: COLORS.green }}>
                  KWD
                </span>
              </div>
            </div>
            <div className="relative">
              <select
                className="
      appearance-none rounded-xl border-2 border-primary-bg bg-transparent px-3 pr-10 py-2
      text-sm font-semibold text-primary-bg
      focus:outline-none focus:ring-2 focus:ring-[#A5F2DE]
    "
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              {/* arrow icon */}
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E2130]/80"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer>
              <BarChart
                data={revenueData}
                barSize={BAR_SIZE}
                barGap={-BAR_SIZE} // <- overlap the two series
                barCategoryGap="55%" // spacing between months
                margin={{ top: 8, right: 6, bottom: 0, left: 0 }}
              >
                {/* no long grid lines */}
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

                {/* <Tooltip
                  cursor={{ fill: '' }}
                  contentStyle={{
                    backgroundColor: COLORS.navy,
                    borderRadius: 12,
                    border: '0px',
                    boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
                  }}
                /> */}

                {/* render the TALL mint bar first (behind), then the navy bar on top */}
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

        {/* Occupancy Rate */}
        <div className="rounded-3xl p-6 md:p-7 shadow-sm bg-bodyTable">
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
                  {/*
            Base donut: draws the RENTED arc (mint) + a transparent gap
          */}
                  <Pie
                    data={[
                      { name: 'RENTED', value: 77 },
                      { name: '_GAP', value: 23 },
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
                    label={makeBadge('RENTED')} // mint % badge
                    isAnimationActive={false}
                  >
                    <Cell fill={COLORS.legendRented} />
                    <Cell fill="transparent" />
                  </Pie>

                  {/*
            Overlay donut: draws the VACANT arc slightly thicker by increasing outerRadius
          */}
                  <Pie
                    data={[
                      { name: '_SPACER', value: 77 },
                      { name: 'VACANT', value: 23 },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={116} // <- a bit bigger than base (visual emphasis)
                    startAngle={90}
                    endAngle={-270}
                    paddingAngle={3}
                    cornerRadius={12}
                    stroke="transparent"
                    labelLine={false}
                    label={makeBadge('VACANT')} // navy slice % badge (text mint)
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

        {/* Unpaid Rent */}
        <div className="rounded-3xl p-6 md:p-7 shadow-sm bg-bodyTable">
          <div
            className="mb-2 text-sm font-semibold"
            style={{ color: COLORS.navy }}
          >
            Unpaid Rent
          </div>
          <div className="mb-3 text-2xl font-extrabold">
            <span style={{ color: COLORS.green }}>723,836,220</span>{' '}
            <span className="font-bold" style={{ color: COLORS.green }}>
              KWD
            </span>
          </div>

          <div className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-6 mt-8">
            {unpaidData.map((row) => (
              <React.Fragment key={row.label}>
                <div
                  className="text-xs font-semibold"
                  style={{ color: COLORS.navy }}
                >
                  {row.label}
                </div>
                <div className="h-6 w-full rounded-full bg-transparent">
                  <div
                    className="h-6 rounded-full"
                    style={{
                      width: `${(row.value / 600000) * 100}%`,
                      background: row.color,
                    }}
                  />
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Axis labels */}
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

/** small legend row component */
function LegendRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="inline-block h-3 w-3 rounded-full"
        style={{ background: color }}
      />
      <span className="text-sm font-semibold" style={{ color: COLORS.navy }}>
        {label}
      </span>
      <span
        className="ml-2 rounded-md bg-white/70 px-2 py-0.5 text-xs font-bold"
        style={{ color: COLORS.navy }}
      >
        {value}
      </span>
    </div>
  );
}

// import assets from '@/assets/images';
// import { ChevronDown } from 'lucide-react';
// import React, { useEffect, useMemo, useState } from 'react';
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   PieChart,
//   Pie,
//   Cell,
// } from 'recharts';
// import service from '@/services/adminapp/reports';

// const BAR_SIZE = 16;
// const CARD_BG = '#DFF6EF';
// const RAD = Math.PI / 180;
// const BADGE_TEXT = '#242460';

// const COLORS = {
//   card: '#DFF6EF',
//   bg: '#EAFBF5',
//   navy: '#242460',
//   mint: '#5EBFA1',
//   green: '#00A14B',
//   legendRented: '#5EBFA1',
//   legendVacant: '#242460',
//   peach: '#FFB277',
//   coral: '#FF8CA7',
//   sage: '#B7D8B6',
// };

// const tickStyle = {
//   fill: COLORS.navy,
//   fontSize: 12,
//   fontWeight: 600,
//   opacity: 0.9,
// };

// type OverviewResp = {
//   success: boolean;
//   revenue: {
//     year: number;
//     total_revenue: number;
//     currency?: string | null;
//     series: { month: string; invoiced: number; collected: number }[];
//   };
//   recent_payments: {
//     items: {
//       invoice_id: string;
//       paid_amount: number;
//       currency?: string | null;
//       created_at: string;
//       tenant_name?: string | null;
//       property_name?: string | null;
//       unit_no?: string | null;
//     }[];
//   };
//   unpaid_aging: {
//     lookback_days: number;
//     total_unpaid: number;
//     buckets: { label: string; value: number }[];
//   };
//   occupancy: {
//     total_units: number;
//     rented: number;
//     vacant: number;
//     percent_rented: number;
//     percent_vacant: number;
//   };
// };

// const makeBadge = (onlyFor: string) => (props: any) => {
//   const { cx, cy, midAngle, innerRadius, name, percent } = props;
//   if (name !== onlyFor) return null;
//   const r = innerRadius - 6;
//   const x = cx + Math.cos(-RAD * midAngle) * r;
//   const y = cy + Math.sin(-RAD * midAngle) * r;
//   const pct = Math.round((percent || 0) * 100) + '%';
//   return (
//     <g>
//       <circle cx={x} cy={y} r={18} fill={CARD_BG} />
//       <text
//         x={x}
//         y={y}
//         textAnchor="middle"
//         dominantBaseline="central"
//         style={{ fill: BADGE_TEXT, fontWeight: 800, fontSize: 12 }}
//       >
//         {pct}
//       </text>
//     </g>
//   );
// };

// // simple "2 hours ago" helper
// const timeAgo = (iso: string) => {
//   const d = new Date(iso);
//   const diff = (Date.now() - d.getTime()) / 1000;
//   const mins = Math.floor(diff / 60);
//   if (mins < 60) return `${mins} min ago`;
//   const hrs = Math.floor(mins / 60);
//   if (hrs < 24) return `${hrs} hours ago`;
//   const days = Math.floor(hrs / 24);
//   return `${days} days ago`;
// };

// export default function ReportGraphs() {
//   const YEARS_TOTAL = 5; // current year + previous 4
//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: YEARS_TOTAL }, (_, i) => currentYear - i);

//   const [selectedYear, setSelectedYear] = useState<number>(currentYear);

//   // API state
//   const [overview, setOverview] = useState<OverviewResp | null>(null);
//   const [loading, setLoading] = useState(false);

//   // derived UI pieces
//   const currency = overview?.revenue.currency || 'KWD';
//   const totalRevenue = overview?.revenue.total_revenue ?? 0;

//   // normalize revenue to 0..120 (so the Y axis matches your design)
//   const revenueData = useMemo(() => {
//     const s = overview?.revenue.series ?? [];
//     if (!s.length) return [];
//     const maxVal = Math.max(
//       1,
//       ...s.flatMap((r) => [r.invoiced || 0, r.collected || 0]),
//     );
//     const scale = (v: number) => Math.round((v / maxVal) * 110); // 110 to leave headroom
//     return s.slice(0, 12).map((r) => ({
//       m: r.month,
//       dark: scale(r.collected || 0), // navy (collected)
//       light: scale(r.invoiced || 0), // mint (invoiced)
//     }));
//   }, [overview]);

//   const payments = overview?.recent_payments.items ?? [];

//   const unpaidMax = useMemo(() => {
//     const b = overview?.unpaid_aging.buckets ?? [];
//     return Math.max(1, ...b.map((x) => x.value || 0));
//   }, [overview]);

//   const occRented = overview?.occupancy.percent_rented ?? 0;
//   const occVacant = overview?.occupancy.percent_vacant ?? 0;

//   const fetchReportOverview = async () => {
//     try {
//       setLoading(true);
//       const res = await service.getReportOverview({
//         year: selectedYear,
//         lookback_days: 150,
//         limit: 3,
//       });
//       setOverview(res.data as OverviewResp);
//     } catch (e) {
//       // handle/log if you want
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchReportOverview();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedYear]);

//   return (
//     <div className="min-h-screen w-full px-6 py-8 md:px-10" style={{ background: COLORS.bg }}>
//       <div className="mt-6 grid gap-6 lg:grid-cols-2">
//         {/* Recent Payments */}
//         <div className="rounded-3xl">
//           <h1 className="mb-16 text-[36px] font-semibold leading-[1.05]" style={{ color: COLORS.navy }}>
//             Reports<br />Overview
//           </h1>

//           <div className="rounded-2xl bg-bodyTable p-6">
//             <div className="mb-2 text-sm font-bold" style={{ color: COLORS.navy }}>
//               Recent Payments
//             </div>
//             <div className="h-[2px] w-full bg-dialogBg" />
//             <ul className="mt-4 space-y-4">
//               {(payments.length ? payments : []).map((p) => (
//                 <li key={p.invoice_id} className="flex items-start gap-3">
//                   <div className="flex h-9 w-9 items-center justify-center rounded-lg">
//                     <img src={assets.images.repIconLogo} className="h-7 w-7 object-contain" />
//                   </div>
//                   <div>
//                     <div className="font-semibold" style={{ color: COLORS.navy }}>
//                       {p.tenant_name || 'Unknown Payer'}
//                     </div>
//                     <div className="text-xs opacity-70" style={{ color: COLORS.navy }}>
//                       {timeAgo(p.created_at)}
//                       {p.property_name ? ` | ${p.property_name}` : ''}
//                       {p.unit_no ? ` - ${p.unit_no}` : ''}
//                     </div>
//                   </div>
//                 </li>
//               ))}
//               {!payments.length && !loading && (
//                 <li className="text-sm text-[#657080]">No recent payments.</li>
//               )}
//             </ul>
//           </div>
//         </div>

//         {/* Total Revenue */}
//         <div className="rounded-3xl bg-bodyTable p-6 shadow-sm md:p-7">
//           <div className="mb-3 flex items-center justify-between">
//             <div>
//               <div className="text-sm font-semibold" style={{ color: COLORS.navy }}>
//                 Total Revenue
//               </div>
//               <div className="mt-2 text-2xl font-extrabold">
//                 <span style={{ color: COLORS.green }}>
//                   {totalRevenue.toLocaleString()}
//                 </span>{' '}
//                 <span className="font-bold" style={{ color: COLORS.green }}>
//                   {currency || 'KWD'}
//                 </span>
//               </div>
//             </div>

//             <div className="relative">
//               <select
//                 className="appearance-none rounded-xl border-2 border-primary-bg bg-transparent px-3 pr-10 py-2 text-sm font-semibold text-primary-bg focus:outline-none focus:ring-2 focus:ring-[#A5F2DE]"
//                 value={selectedYear}
//                 onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
//               >
//                 {years.map((y) => (
//                   <option key={y} value={y}>
//                     {y}
//                   </option>
//                 ))}
//               </select>
//               <ChevronDown
//                 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1E2130]/80"
//                 aria-hidden="true"
//               />
//             </div>
//           </div>

//           <div className="h-[260px] w-full">
//             <ResponsiveContainer>
//               <BarChart
//                 data={revenueData}
//                 barSize={BAR_SIZE}
//                 barGap={-BAR_SIZE}
//                 barCategoryGap="55%"
//                 margin={{ top: 8, right: 6, bottom: 0, left: 0 }}
//               >
//                 <CartesianGrid horizontal={false} vertical={false} />
//                 <XAxis dataKey="m" tick={tickStyle} axisLine={false} tickLine={false} />
//                 <YAxis
//                   tick={tickStyle}
//                   axisLine={false}
//                   tickLine={{ stroke: 'rgba(31,33,80,0.35)' }}
//                   tickSize={0}
//                   width={30}
//                   domain={[0, 120]}
//                   ticks={[0, 20, 40, 60, 80, 100]}
//                 />
//                 <Tooltip
//                   cursor={{ fill: 'rgba(0,0,0,0.04)' }}
//                   contentStyle={{
//                     borderRadius: 12,
//                     border: '0px',
//                     boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
//                   }}
//                   formatter={(v: number, k: string) => [
//                     v, k === 'dark' ? 'Collected (norm.)' : 'Invoiced (norm.)',
//                   ]}
//                 />
//                 {/* mint first (behind), then navy on top */}
//                 <Bar dataKey="light" radius={[12, 12, 12, 12]} fill={COLORS.mint} />
//                 <Bar dataKey="dark" radius={[12, 12, 12, 12]} fill={COLORS.navy} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* Occupancy Rate */}
//         <div className="rounded-3xl bg-bodyTable p-6 shadow-sm md:p-7">
//           <div className="mb-2 text-sm font-semibold" style={{ color: COLORS.navy }}>
//             Occupancy Rate
//           </div>

//           <div className="flex items-center justify-center gap-6">
//             <div className="h-[260px] w-[260px]">
//               <ResponsiveContainer>
//                 <PieChart>
//                   {/* base donut (RENTED) */}
//                   <Pie
//                     data={[
//                       { name: 'RENTED', value: Math.round(occRented) },
//                       { name: '_GAP', value: Math.max(0, 100 - Math.round(occRented)) },
//                     ]}
//                     dataKey="value"
//                     nameKey="name"
//                     innerRadius={70}
//                     outerRadius={110}
//                     startAngle={90}
//                     endAngle={-270}
//                     paddingAngle={3}
//                     cornerRadius={12}
//                     stroke="transparent"
//                     labelLine={false}
//                     label={makeBadge('RENTED')}
//                     isAnimationActive={false}
//                   >
//                     <Cell fill={COLORS.legendRented} />
//                     <Cell fill="transparent" />
//                   </Pie>

//                   {/* overlay donut (VACANT) a bit thicker */}
//                   <Pie
//                     data={[
//                       { name: '_SPACER', value: Math.round(occRented) },
//                       { name: 'VACANT', value: Math.round(occVacant) },
//                     ]}
//                     dataKey="value"
//                     nameKey="name"
//                     innerRadius={70}
//                     outerRadius={116}
//                     startAngle={90}
//                     endAngle={-270}
//                     paddingAngle={3}
//                     cornerRadius={12}
//                     stroke="transparent"
//                     labelLine={false}
//                     label={makeBadge('VACANT')}
//                     isAnimationActive={false}
//                   >
//                     <Cell fill="transparent" />
//                     <Cell fill={COLORS.legendVacant} />
//                   </Pie>
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Legend */}
//           <div className="mt-4 flex items-center gap-8">
//             <div className="flex items-center gap-2">
//               <span className="inline-block h-3 w-3 rounded-full" style={{ background: COLORS.legendRented }} />
//               <span className="text-sm font-semibold" style={{ color: COLORS.navy }}>RENTED</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="inline-block h-3 w-3 rounded-full" style={{ background: COLORS.legendVacant }} />
//               <span className="text-sm font-semibold" style={{ color: COLORS.navy }}>VACANT</span>
//             </div>
//           </div>
//         </div>

//         {/* Unpaid Rent */}
//         <div className="rounded-3xl bg-bodyTable p-6 shadow-sm md:p-7">
//           <div className="mb-2 text-sm font-semibold" style={{ color: COLORS.navy }}>
//             Unpaid Rent
//           </div>
//           <div className="mb-3 text-2xl font-extrabold">
//             <span style={{ color: COLORS.green }}>
//               {(overview?.unpaid_aging.total_unpaid ?? 0).toLocaleString()}
//             </span>{' '}
//             <span className="font-bold" style={{ color: COLORS.green }}>
//               {currency || 'KWD'}
//             </span>
//           </div>

//           <div className="mt-8 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-6">
//             {(overview?.unpaid_aging.buckets ?? []).map((row) => (
//               <React.Fragment key={row.label}>
//                 <div className="text-xs font-semibold" style={{ color: COLORS.navy }}>
//                   {row.label} Days
//                 </div>
//                 <div className="h-6 w-full rounded-full bg-white/70">
//                   <div
//                     className="h-6 rounded-full"
//                     style={{
//                       width: `${(row.value / unpaidMax) * 100}%`,
//                       background:
//                         row.label === '0-30'
//                           ? COLORS.navy
//                           : row.label === '31-60'
//                           ? COLORS.peach
//                           : row.label === '61-90'
//                           ? COLORS.coral
//                           : COLORS.sage,
//                     }}
//                   />
//                 </div>
//               </React.Fragment>
//             ))}
//           </div>

//           <div className="mt-6 flex justify-between text-[11px] font-semibold" style={{ color: COLORS.navy }}>
//             <span>0</span><span>100K</span><span>200K</span><span>300K</span><span>400K</span><span>500K</span><span>600K</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
