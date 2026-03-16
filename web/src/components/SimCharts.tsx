"use client";

import { useState } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, ComposedChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Cell,
} from "recharts";
import Image from "next/image";
import { Lock, Unlock } from "lucide-react";
import type { SimResults } from "@/lib/simulator";
import { OBSERVED_DATA } from "@/lib/observed";
import { useLocale } from "@/lib/i18n";

interface SimChartsProps {
  results: SimResults;
}

/** War start date: Feb 28, 2026 */
const WAR_START = new Date(2026, 1, 28);

function dayToDate(day: number): string {
  const d = new Date(WAR_START);
  d.setDate(d.getDate() + day);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function getTodayDay(): number {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor((today.getTime() - WAR_START.getTime()) / (1000 * 60 * 60 * 24));
}

const CHART_COLORS = {
  red: "#C41E3A",
  orange: "rgba(255, 140, 0, 0.6)",
  blue: "#2563eb",
  green: "#16a34a",
  gray: "#666",
  yellow: "#FFE500",
  observed: "#C41E3A",
};

const AXIS_STYLE = {
  fontFamily: "'Courier Prime', monospace",
  fontSize: 10,
  fill: "#4A4A4A",
};

const TOOLTIP_STYLE = {
  contentStyle: {
    background: "#F5F0E1",
    border: "1px solid #1A1A1A",
    fontFamily: "'Courier Prime', monospace",
    fontSize: 12,
  },
};

/** Custom X-axis tick showing date, highlight today/yesterday */
function DateTick({ x, y, payload, todayDay }: {
  x: number; y: number;
  payload: { value: number };
  todayDay: number;
}) {
  const day = payload.value;
  const isToday = day === todayDay;
  const isYesterday = day === todayDay - 1;
  const highlighted = isToday || isYesterday;

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        dy={12}
        textAnchor="middle"
        style={{
          ...AXIS_STYLE,
          fontSize: 9,
          fill: highlighted ? CHART_COLORS.red : AXIS_STYLE.fill,
          fontWeight: highlighted ? 700 : 400,
        }}
      >
        {dayToDate(day)}
      </text>
    </g>
  );
}

/** Custom dot for today & yesterday highlights */
function HighlightDot(props: {
  cx?: number; cy?: number;
  payload?: { day: number };
  todayDay: number;
  color: string;
}) {
  const { cx, cy, payload, todayDay, color } = props;
  if (!cx || !cy || !payload) return null;
  const day = payload.day;
  const isToday = day === todayDay;
  const isYesterday = day === todayDay - 1;
  if (!isToday && !isYesterday) return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={isToday ? 8 : 6} fill={color} opacity={0.15} />
      <circle cx={cx} cy={cy} r={isToday ? 4.5 : 3.5} fill={color} stroke="#F5F0E1" strokeWidth={1.5} />
    </g>
  );
}

/** Declassify toggle */
function DeclassifyBlock({ explanation }: { explanation: string }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 font-typewriter text-xs tracking-wider text-stamp-red/70 hover:text-stamp-red transition-colors uppercase py-1"
      >
        {open ? <Unlock size={14} /> : <Lock size={14} />}
        {open ? t.reclassify : t.declassify}
      </button>
      {open && (
        <div className="mt-2 px-3 py-2.5 bg-paper-dark/50 border-l-2 border-stamp-red/30 text-[11px] font-mono text-ink-light leading-relaxed animate-fade-in-up">
          {explanation}
        </div>
      )}
    </div>
  );
}

export default function SimCharts({ results }: SimChartsProps) {
  const { t, locale } = useLocale();
  const { salvos, tels, stocks } = results;
  const todayDay = getTodayDay();
  const yesterdayDay = todayDay - 1;

  // Build observed data lookup (by day index)
  const observedByDay = new Map(OBSERVED_DATA.map((d) => [d.day, d]));

  const tooltipLabelFormatter = (label: unknown) => {
    const day = Number(label);
    const date = dayToDate(day);
    const prefix = day === todayDay
      ? ` (${t.today})`
      : day === yesterdayDay
        ? ` (${t.yesterday})`
        : "";
    return locale === "zh"
      ? `第 ${day} 天 · ${date}${prefix}`
      : `Day ${day} · ${date}${prefix}`;
  };

  const timeReferenceLines = (
    <>
      {yesterdayDay >= 0 && yesterdayDay < results.days && (
        <ReferenceLine x={yesterdayDay} stroke={CHART_COLORS.gray} strokeDasharray="3 3" strokeWidth={1} opacity={0.5} />
      )}
      {todayDay >= 0 && todayDay < results.days && (
        <ReferenceLine
          x={todayDay} stroke={CHART_COLORS.red} strokeDasharray="4 2" strokeWidth={1.5} opacity={0.6}
          label={{ value: t.today, position: "top", style: { ...AXIS_STYLE, fontSize: 9, fill: CHART_COLORS.red, fontWeight: 700 } }}
        />
      )}
    </>
  );

  const renderDateTick = (props: Record<string, unknown>) => (
    <DateTick {...props as { x: number; y: number; payload: { value: number } }} todayDay={todayDay} />
  );

  // ─── Panel 4: Model vs Reality (salvo overlay) ───
  const comparisonData = salvos.map((s) => ({
    day: s.day,
    simMedian: s.median,
    simP25: s.p25,
    simP75: s.p75,
    observed: observedByDay.get(s.day)?.salvos ?? null,
  }));

  // ─── Panel 5: Deviation chart (sim - observed per day) ───
  const deviationData = OBSERVED_DATA
    .filter((obs) => obs.day < results.days)
    .map((obs) => {
      const sim = salvos[obs.day];
      return {
        day: obs.day,
        date: obs.date,
        deviation: sim ? parseFloat((sim.median - obs.salvos).toFixed(1)) : 0,
      };
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Panel 1: Salvo Bandwidth Decay */}
      <div className="dossier-panel scanline-overlay">
        <div className="file-number mb-1">{t.panel01}</div>
        <h3 className="font-heading text-sm mb-4 tracking-wider">
          {t.dailyMissileSalvo}
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={salvos}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="day" tick={renderDateTick} interval={1} />
            <YAxis tick={AXIS_STYLE} label={{ value: t.axisMissilesPerDay, angle: -90, position: "insideLeft", style: AXIS_STYLE }} />
            <Tooltip {...TOOLTIP_STYLE} labelFormatter={tooltipLabelFormatter} />
            {timeReferenceLines}
            <Area dataKey="p75" stroke="none" fill={CHART_COLORS.orange} name="75th pctl" />
            <Area dataKey="p25" stroke="none" fill="#F5F0E1" name="25th pctl" />
            <Line
              type="monotone" dataKey="median" stroke={CHART_COLORS.red} strokeWidth={2}
              dot={(props: Record<string, unknown>) => (
                <HighlightDot {...props as { cx: number; cy: number; payload: { day: number } }} todayDay={todayDay} color={CHART_COLORS.red} />
              )}
              name="Median"
            />
            <ReferenceLine
              y={10} stroke={CHART_COLORS.gray} strokeDasharray="5 5"
              label={{ value: t.guerillaThreshold, position: "right", style: { ...AXIS_STYLE, fontSize: 9 } }}
            />
          </AreaChart>
        </ResponsiveContainer>
        <DeclassifyBlock explanation={t.explainSalvo} />
      </div>

      {/* Panel 2: TEL Survival */}
      <div className="dossier-panel">
        <div className="file-number mb-1">{t.panel02}</div>
        <h3 className="font-heading text-sm mb-4 tracking-wider">
          {t.mobileLauncherDecay}
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={tels}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="day" tick={renderDateTick} interval={1} />
            <YAxis tick={AXIS_STYLE} label={{ value: t.axisOperationalUnits, angle: -90, position: "insideLeft", style: AXIS_STYLE }} />
            <Tooltip {...TOOLTIP_STYLE} labelFormatter={tooltipLabelFormatter} />
            {timeReferenceLines}
            <Area dataKey="max" stroke="none" fill="rgba(37,99,235,0.1)" name="Max" />
            <Area dataKey="min" stroke="none" fill="#F5F0E1" name="Min" />
            <Line
              type="monotone" dataKey="median" stroke={CHART_COLORS.blue} strokeWidth={2}
              dot={(props: Record<string, unknown>) => (
                <HighlightDot {...props as { cx: number; cy: number; payload: { day: number } }} todayDay={todayDay} color={CHART_COLORS.blue} />
              )}
              name="Median"
            />
          </AreaChart>
        </ResponsiveContainer>
        <DeclassifyBlock explanation={t.explainTel} />
      </div>

      {/* Panel 3: Stock Attrition */}
      <div className="dossier-panel">
        <div className="file-number mb-1">{t.panel03}</div>
        <h3 className="font-heading text-sm mb-4 tracking-wider">
          {t.totalStockAttrition}
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={stocks}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="day" tick={renderDateTick} interval={1} />
            <YAxis tick={AXIS_STYLE} label={{ value: t.axisMissiles, angle: -90, position: "insideLeft", style: AXIS_STYLE }} />
            <Tooltip {...TOOLTIP_STYLE} labelFormatter={tooltipLabelFormatter} />
            {timeReferenceLines}
            <Line
              type="monotone" dataKey="median" stroke={CHART_COLORS.green} strokeWidth={2}
              dot={(props: Record<string, unknown>) => (
                <HighlightDot {...props as { cx: number; cy: number; payload: { day: number } }} todayDay={todayDay} color={CHART_COLORS.green} />
              )}
              name="Median"
            />
            <Line type="monotone" dataKey="p25" stroke={CHART_COLORS.green} strokeWidth={1} strokeDasharray="3 3" dot={false} opacity={0.4} name="25th pctl" />
            <Line type="monotone" dataKey="p75" stroke={CHART_COLORS.green} strokeWidth={1} strokeDasharray="3 3" dot={false} opacity={0.4} name="75th pctl" />
          </LineChart>
        </ResponsiveContainer>
        <DeclassifyBlock explanation={t.explainStock} />
      </div>

      {/* Panel 4: Model vs Reality — salvo comparison overlay */}
      <div className="dossier-panel">
        <div className="file-number mb-1">{t.panel04}</div>
        <h3 className="font-heading text-sm mb-4 tracking-wider">
          {t.modelVsReality}
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="day" tick={renderDateTick} interval={1} />
            <YAxis tick={AXIS_STYLE} label={{ value: t.axisMissilesPerDay, angle: -90, position: "insideLeft", style: AXIS_STYLE }} />
            <Tooltip
              {...TOOLTIP_STYLE}
              labelFormatter={tooltipLabelFormatter}
              formatter={(value: unknown, name: unknown) => {
                const v = Number(value);
                const n = String(name ?? "");
                if (n === "observed") return [isNaN(v) ? "—" : v.toFixed(0), t.observed];
                if (n === "simMedian") return [v.toFixed(1), t.simMedian];
                return [v.toFixed(1), n];
              }}
            />
            {timeReferenceLines}
            <Area dataKey="simP75" stroke="none" fill="rgba(255,140,0,0.15)" name="simP75" />
            <Area dataKey="simP25" stroke="none" fill="#F5F0E1" name="simP25" />
            <Line type="monotone" dataKey="simMedian" stroke={CHART_COLORS.red} strokeWidth={2} dot={false} name="simMedian" />
            <Scatter
              dataKey="observed" name="observed"
              fill={CHART_COLORS.observed} stroke="#F5F0E1" strokeWidth={1.5}
              shape="diamond" legendType="diamond"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <DeclassifyBlock explanation={t.explainModelVsReality} />
      </div>

      {/* Panel 5: Daily Deviation (sim - observed) */}
      <div className="dossier-panel lg:col-span-2 relative overflow-hidden">
        {/* Anti-war watermark behind deviation chart */}
        <div className="absolute right-4 bottom-8 opacity-[0.03] pointer-events-none select-none mix-blend-multiply">
          <Image src="/antiwar-dove-missile.png" alt="" width={300} height={150} className="w-52 md:w-72" aria-hidden="true" />
        </div>
        <div className="file-number mb-1">{t.panel05}</div>
        <h3 className="font-heading text-sm mb-4 tracking-wider">
          {t.deviationByDay}
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={deviationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
            <XAxis dataKey="day" tick={renderDateTick} interval={0} />
            <YAxis tick={AXIS_STYLE} label={{ value: t.axisMissilesPerDay, angle: -90, position: "insideLeft", style: AXIS_STYLE }} />
            <Tooltip
              {...TOOLTIP_STYLE}
              labelFormatter={tooltipLabelFormatter}
              formatter={(value: unknown) => [`${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(1)}`, "Δ"]}
            />
            <ReferenceLine y={0} stroke="#1A1A1A" />
            <Bar dataKey="deviation" name="Δ Salvo" stroke="#1A1A1A" strokeWidth={0.5}>
              {deviationData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.deviation >= 0 ? CHART_COLORS.yellow : CHART_COLORS.red}
                  opacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <DeclassifyBlock explanation={t.explainDeviation} />
      </div>
    </div>
  );
}
