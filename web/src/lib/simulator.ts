/**
 * OPERATION KABOOM — TypeScript Missile Force Attrition Simulator
 * Port of the Python Monte Carlo model for browser-side execution.
 *
 * v2: C2 disruption, solid/liquid fuel differentiation, proxy compensation.
 */

export interface SimParams {
  initialStock: number;
  initialTels: number;
  dailyProduction: number;
  day1Salvo: number;
  telAttritionProb: number;
  factoryDisruption: number;
  tacticalDecay: number;
  telReloadCapacity: number;
  days: number;
  runs: number;
  // --- v2 parameters ---
  /** C2 command integrity (0–1). 1 = fully functional, 0.34 = post-decapitation. */
  c2Integrity: number;
  /** Daily C2 degradation rate (e.g., 0.04 = loses 4% per day). */
  c2DecayRate: number;
  /** Fraction of TEL fleet using solid fuel (lower attrition). */
  solidFuelRatio: number;
  /** Daily proxy force salvo (additive, independent of domestic TELs). */
  proxySalvo: number;
  /** Daily proxy fire decay multiplier. */
  proxyDecay: number;
}

export const DEFAULT_PARAMS: SimParams = {
  initialStock: 2500,
  initialTels: 125,
  dailyProduction: 10,
  day1Salvo: 150,
  telAttritionProb: 0.12,
  factoryDisruption: 0.95,
  tacticalDecay: 0.85,
  telReloadCapacity: 1.5,
  days: 21,
  runs: 500,
  c2Integrity: 1.0,
  c2DecayRate: 0.0,
  solidFuelRatio: 0.6,
  proxySalvo: 0.0,
  proxyDecay: 0.95,
};

/** Preset: C2 collapse scenario (post-leadership decapitation) */
export const C2_COLLAPSE_PARAMS: Partial<SimParams> = {
  c2Integrity: 0.34,
  c2DecayRate: 0.04,
  solidFuelRatio: 0.6,
};

/** Preset: Proxy shift scenario (Hezbollah/Houthi compensation) */
export const PROXY_SHIFT_PARAMS: Partial<SimParams> = {
  c2Integrity: 0.50,
  c2DecayRate: 0.02,
  proxySalvo: 20.0,
  proxyDecay: 0.92,
};

export interface SimResults {
  /** Per-day statistics: median, p25, p75, min, max for each metric */
  stocks: DayStat[];
  tels: DayStat[];
  salvos: DayStat[];
  days: number;
  runs: number;
}

export interface DayStat {
  day: number;
  median: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
}

/**
 * Binomial random variable: number of successes in n Bernoulli trials with probability p.
 * For small n (< ~1000), direct simulation is fast enough.
 */
function randomBinomial(n: number, p: number): number {
  let successes = 0;
  for (let i = 0; i < n; i++) {
    if (Math.random() < p) successes++;
  }
  return successes;
}

/** Compute percentile from sorted array using linear interpolation */
function percentile(sorted: number[], p: number): number {
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

/**
 * Run the Monte Carlo simulation and return per-day summary statistics.
 * We compute stats on-the-fly per day across runs rather than storing the full (runs x days) matrix,
 * which is more memory-efficient for the browser.
 */
export function runSimulation(params: SimParams): SimResults {
  const {
    initialStock, initialTels, dailyProduction, day1Salvo,
    telAttritionProb, factoryDisruption, tacticalDecay,
    telReloadCapacity, days, runs,
    c2Integrity, c2DecayRate, solidFuelRatio, proxySalvo, proxyDecay,
  } = params;

  const effectiveProduction = dailyProduction * (1 - factoryDisruption);

  // Solid-fuel TELs have ~50% of base attrition (fast shoot-and-scoot).
  // Liquid-fuel TELs have ~180% of base attrition (long fueling window).
  const solidAttritionProb = telAttritionProb * 0.5;
  const liquidAttritionProb = Math.min(1.0, telAttritionProb * 1.8);

  // Collect all run values per day, then summarize
  const stocksAll: number[][] = Array.from({ length: days }, () => []);
  const telsAll: number[][] = Array.from({ length: days }, () => []);
  const salvosAll: number[][] = Array.from({ length: days }, () => []);

  for (let r = 0; r < runs; r++) {
    let stock = initialStock;
    let solidTels = Math.round(initialTels * solidFuelRatio);
    let liquidTels = initialTels - solidTels;
    let tels = solidTels + liquidTels;
    let salvo = day1Salvo;
    let c2 = c2Integrity;
    let proxy = proxySalvo;

    stocksAll[0].push(stock);
    telsAll[0].push(tels);
    salvosAll[0].push(salvo + proxy);

    for (let d = 1; d < days; d++) {
      // C2 degrades daily (leadership vacuum, comms disruption)
      c2 = Math.max(0, c2 - c2DecayRate);

      // Differential TEL attrition by fuel type
      const solidLost = randomBinomial(solidTels, solidAttritionProb);
      const liquidLost = randomBinomial(liquidTels, liquidAttritionProb);
      solidTels = Math.max(0, solidTels - solidLost);
      liquidTels = Math.max(0, liquidTels - liquidLost);
      tels = solidTels + liquidTels;

      // Intended launch gated by tactical decay AND C2 integrity
      const intended = salvo * tacticalDecay * c2;
      salvo = Math.min(stock, tels * telReloadCapacity, intended);

      // Proxy fire decays independently
      proxy = proxy * proxyDecay;

      stock = stock - salvo + effectiveProduction;

      stocksAll[d].push(stock);
      telsAll[d].push(tels);
      salvosAll[d].push(salvo + proxy);
    }
  }

  function summarize(allDays: number[][]): DayStat[] {
    return allDays.map((values, day) => {
      const sorted = [...values].sort((a, b) => a - b);
      return {
        day,
        median: percentile(sorted, 50),
        p25: percentile(sorted, 25),
        p75: percentile(sorted, 75),
        min: sorted[0],
        max: sorted[sorted.length - 1],
      };
    });
  }

  return {
    stocks: summarize(stocksAll),
    tels: summarize(telsAll),
    salvos: summarize(salvosAll),
    days,
    runs,
  };
}
