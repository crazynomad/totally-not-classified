"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { Rocket, Play, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { DEFAULT_PARAMS, C2_COLLAPSE_PARAMS, PROXY_SHIFT_PARAMS, runSimulation, type SimParams, type SimResults } from "@/lib/simulator";
import { useLocale } from "@/lib/i18n";
import ParamControl from "@/components/ParamControl";
import SimCharts from "@/components/SimCharts";
import StampBadge from "@/components/StampBadge";

export default function Home() {
  const { t } = useLocale();
  const [params, setParams] = useState<SimParams>(DEFAULT_PARAMS);
  const [results, setResults] = useState<SimResults | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const hasAutoRun = useRef(false);

  useEffect(() => {
    if (hasAutoRun.current) return;
    hasAutoRun.current = true;
    const t0 = performance.now();
    const sim = runSimulation(DEFAULT_PARAMS);
    const dt = performance.now() - t0;
    setResults(sim);
    setElapsed(dt);
  }, []);

  const updateParam = useCallback(<K extends keyof SimParams>(key: K, value: SimParams[K]) => {
    setParams((p) => ({ ...p, [key]: value }));
  }, []);

  const handleRun = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const t0 = performance.now();
      const sim = runSimulation(params);
      const dt = performance.now() - t0;
      setResults(sim);
      setElapsed(dt);
      setRunning(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }, 50);
  }, [params]);

  const handleReset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    const t0 = performance.now();
    const sim = runSimulation(DEFAULT_PARAMS);
    const dt = performance.now() - t0;
    setResults(sim);
    setElapsed(dt);
  }, []);

  return (
    <main className="min-h-screen bg-grid">
      {/* ─── Header ─── */}
      <header className="border-b border-ink/30">
        <div className="page-container py-3 flex items-center justify-between">
          <div className="file-number">{t.fileNumber}</div>
          <div className="font-typewriter text-[11px] tracking-widest opacity-40">
            {t.classification}
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="page-container pt-10 pb-6 md:pt-14 md:pb-8 relative">
        {/* Anti-war watermark — peace symbol behind hero */}
        <div className="absolute right-4 md:right-12 top-6 opacity-[0.04] pointer-events-none select-none mix-blend-multiply">
          <Image src="/antiwar-peace-stamp.png" alt="" width={280} height={280} className="w-48 md:w-72" aria-hidden="true" />
        </div>
        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-12">
          <div className="flex-1 animate-fade-in-up">
            <div className="classification mb-5">{t.topSecret}</div>
            <h1 className="font-stamp text-3xl md:text-5xl leading-tight mb-4 whitespace-pre-line">
              {t.operationTitle}
            </h1>
            <p className="font-typewriter text-ink-light text-sm md:text-base leading-relaxed max-w-xl">
              {t.heroDesc}
            </p>
            <div className="mt-5 pb-2">
              <p className="font-handwritten text-stamp-red text-lg rotate-[-1.5deg] inline-block">
                {t.heroJoke}
              </p>
            </div>
          </div>
          <div className="animate-fade-in-up-3 flex-shrink-0">
            <StampBadge text={t.stampText} size={110} />
          </div>
        </div>
      </section>

      {/* ─── Anti-war marginalia ─── */}
      <div className="page-container">
        <div className="antiwar-strip">
          <span className="antiwar-quote">&ldquo;PEACE SELLS... BUT WHO&apos;S BUYING?&rdquo;</span>
          <span className="antiwar-dot">✦</span>
          <span className="antiwar-quote">RUST IN PEACE</span>
          <span className="antiwar-dot">✦</span>
          <span className="antiwar-quote">...AND JUSTICE FOR ALL</span>
          <span className="antiwar-dot">✦</span>
          <span className="antiwar-quote">WAR PIGS</span>
        </div>
      </div>

      {/* ─── Section A — Charts ─── */}
      {results && (
        <section ref={resultsRef}>
          <div className="page-container">
            <hr className="section-divider" />
          </div>
          <div className="page-container pb-2 animate-fade-in-up">
            <div className="flex items-baseline gap-3 mb-6">
              <div>
                <div className="file-number mb-1">{t.sectionB}</div>
                <h2 className="font-heading text-base md:text-lg tracking-wider">
                  {t.simResults}
                </h2>
              </div>
              <span className="font-mono text-[11px] text-ink-gray">
                {t.runsXDays(results.runs, results.days)}
              </span>
            </div>
            <SimCharts results={results} />
          </div>
        </section>
      )}

      {/* ─── Section B — Summary Stats ─── */}
      {results && (
        <section>
          <div className="page-container">
            <hr className="section-divider" />
          </div>
          <div className="page-container pb-2">
            <div className="file-number mb-4">{t.sectionBStats}</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                label={t.finalSalvo}
                value={results.salvos[results.days - 1].median.toFixed(1)}
                unit={t.missilesPerDay}
                note={results.salvos[results.days - 1].median < 10 ? t.belowGuerilla : undefined}
              />
              <StatCard
                label={t.telSurvival}
                value={results.tels[results.days - 1].median.toFixed(0)}
                unit={t.operationalUnits}
              />
              <StatCard
                label={t.remainingStock}
                value={results.stocks[results.days - 1].median.toFixed(0)}
                unit={t.missiles}
              />
            </div>
          </div>
        </section>
      )}

      {/* ─── Section C — Parameters ─── */}
      <section>
        <div className="page-container">
          <hr className="section-divider" />
        </div>
        <div className="page-container pb-10">
          <div className="dossier-panel-elevated">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="file-number mb-1">{t.sectionA}</div>
                <h2 className="font-heading text-base md:text-lg tracking-wider">
                  {t.missionConfig}
                </h2>
              </div>
              <Rocket className="text-stamp-red opacity-70" size={24} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
              <ParamControl
                label={t.initialStock}
                sublabel={t.initialStockSub}
                value={params.initialStock}
                onChange={(v) => updateParam("initialStock", v)}
                min={100} max={10000} step={100}
              />
              <ParamControl
                label={t.initialTels}
                sublabel={t.initialTelsSub}
                value={params.initialTels}
                onChange={(v) => updateParam("initialTels", v)}
                min={10} max={500} step={5}
              />
              <ParamControl
                label={t.day1Salvo}
                sublabel={t.day1SalvoSub}
                value={params.day1Salvo}
                onChange={(v) => updateParam("day1Salvo", v)}
                min={10} max={500} step={10}
              />
              <ParamControl
                label={t.telAttritionProb}
                sublabel={t.telAttritionProbSub}
                value={params.telAttritionProb}
                onChange={(v) => updateParam("telAttritionProb", v)}
                min={0} max={0.5} step={0.01}
              />
              <ParamControl
                label={t.days}
                sublabel={t.daysSub}
                value={params.days}
                onChange={(v) => updateParam("days", v)}
                min={5} max={90} step={1}
              />
              <ParamControl
                label={t.monteCarloRuns}
                sublabel={t.monteCarloRunsSub}
                value={params.runs}
                onChange={(v) => updateParam("runs", v)}
                min={50} max={2000} step={50}
              />
            </div>

            {/* Scenario presets */}
            <div className="mt-6 pt-4 border-t border-dashed border-ink/15">
              <div className="font-typewriter text-[10px] tracking-widest text-ink-gray uppercase mb-3">
                {t.scenarioPresets}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className="px-3 py-1.5 font-typewriter text-[11px] tracking-wider border border-ink/20 rounded hover:bg-ink/5 transition-colors"
                  onClick={() => setParams({ ...DEFAULT_PARAMS, days: params.days, runs: params.runs })}
                >
                  {t.scenarioBaseline}
                </button>
                <button
                  className="px-3 py-1.5 font-typewriter text-[11px] tracking-wider border border-red-800/40 text-red-900 rounded hover:bg-red-900/5 transition-colors"
                  onClick={() => setParams({ ...DEFAULT_PARAMS, ...C2_COLLAPSE_PARAMS, days: params.days, runs: params.runs })}
                >
                  {t.scenarioC2Collapse}
                </button>
                <button
                  className="px-3 py-1.5 font-typewriter text-[11px] tracking-wider border border-amber-800/40 text-amber-900 rounded hover:bg-amber-900/5 transition-colors"
                  onClick={() => setParams({ ...DEFAULT_PARAMS, ...PROXY_SHIFT_PARAMS, days: params.days, runs: params.runs })}
                >
                  {t.scenarioProxyShift}
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 mt-6 font-typewriter text-xs text-ink-light hover:text-ink transition-colors tracking-wider"
            >
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {t.advancedParams}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5 mt-4 pt-4 border-t border-dashed border-ink/15">
                <ParamControl
                  label={t.dailyProduction}
                  sublabel={t.dailyProductionSub}
                  value={params.dailyProduction}
                  onChange={(v) => updateParam("dailyProduction", v)}
                  min={0} max={50} step={1}
                />
                <ParamControl
                  label={t.factoryDisruption}
                  sublabel={t.factoryDisruptionSub}
                  value={params.factoryDisruption}
                  onChange={(v) => updateParam("factoryDisruption", v)}
                  min={0} max={1} step={0.05}
                />
                <ParamControl
                  label={t.tacticalDecay}
                  sublabel={t.tacticalDecaySub}
                  value={params.tacticalDecay}
                  onChange={(v) => updateParam("tacticalDecay", v)}
                  min={0.5} max={1} step={0.01}
                />
                <ParamControl
                  label={t.telReloadCapacity}
                  sublabel={t.telReloadCapacitySub}
                  value={params.telReloadCapacity}
                  onChange={(v) => updateParam("telReloadCapacity", v)}
                  min={0.5} max={5} step={0.1}
                />
                <ParamControl
                  label={t.c2Integrity}
                  sublabel={t.c2IntegritySub}
                  value={params.c2Integrity}
                  onChange={(v) => updateParam("c2Integrity", v)}
                  min={0} max={1} step={0.01}
                />
                <ParamControl
                  label={t.c2DecayRate}
                  sublabel={t.c2DecayRateSub}
                  value={params.c2DecayRate}
                  onChange={(v) => updateParam("c2DecayRate", v)}
                  min={0} max={0.1} step={0.005}
                />
                <ParamControl
                  label={t.solidFuelRatio}
                  sublabel={t.solidFuelRatioSub}
                  value={params.solidFuelRatio}
                  onChange={(v) => updateParam("solidFuelRatio", v)}
                  min={0} max={1} step={0.05}
                />
                <ParamControl
                  label={t.proxySalvo}
                  sublabel={t.proxySalvoSub}
                  value={params.proxySalvo}
                  onChange={(v) => updateParam("proxySalvo", v)}
                  min={0} max={50} step={1}
                />
                <ParamControl
                  label={t.proxyDecay}
                  sublabel={t.proxyDecaySub}
                  value={params.proxyDecay}
                  onChange={(v) => updateParam("proxyDecay", v)}
                  min={0.5} max={1} step={0.01}
                />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 mt-8 pt-5 border-t border-ink/15">
              <button
                className="btn-primary flex items-center gap-2"
                onClick={handleRun}
                disabled={running}
              >
                <Play size={16} />
                {running ? t.runningSim : t.launchSim}
              </button>
              <button className="btn-secondary flex items-center gap-2" onClick={handleReset}>
                <RotateCcw size={16} />
                {t.reset}
              </button>
              {elapsed !== null && (
                <span className="font-mono text-[11px] text-ink-gray">
                  {t.runsCompleted(params.runs, elapsed.toFixed(0))}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-ink/20 bg-paper-dark/40 relative overflow-hidden">
        {/* Dove-missile watermark in footer */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.035] pointer-events-none select-none mix-blend-multiply">
          <Image src="/antiwar-dove-missile.png" alt="" width={500} height={250} className="w-80 md:w-[500px]" aria-hidden="true" />
        </div>
        <div className="page-container py-8 text-center relative z-10">
          <div className="antiwar-footer-quote">
            <span className="font-typewriter text-[10px] tracking-[0.25em] text-ink-gray/50 uppercase">
              &ldquo;{t.antiwarFooterQuote}&rdquo;
            </span>
          </div>
          <p className="font-typewriter text-[11px] text-ink-gray tracking-wider leading-relaxed mt-4">
            {t.footerLine1}
          </p>
          <p className="font-handwritten text-stamp-red text-sm mt-3 opacity-80">
            {t.footerLine2}
          </p>
          {/* Swords to plowshares — tiny footer emblem */}
          <div className="mt-5 flex justify-center opacity-[0.08] mix-blend-multiply">
            <Image src="/antiwar-swords-plowshares.png" alt="" width={120} height={60} className="w-24" aria-hidden="true" />
          </div>
        </div>
      </footer>
    </main>
  );
}

function StatCard({
  label, value, unit, note,
}: {
  label: string; value: string; unit: string; note?: string;
}) {
  return (
    <div className="stat-card">
      <div className="font-typewriter text-[10px] text-ink-gray tracking-wider uppercase mb-2">
        {label}
      </div>
      <div className="font-mono text-3xl md:text-4xl font-bold leading-none">{value}</div>
      <div className="font-mono text-[11px] text-ink-gray mt-2">{unit}</div>
      {note && (
        <div className="font-stamp text-stamp-red text-[10px] mt-3 tracking-wider">
          ⚠ {note}
        </div>
      )}
    </div>
  );
}
