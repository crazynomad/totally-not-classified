"use client";

import { createContext, useContext } from "react";

export type Locale = "en" | "zh";

export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language || "";
  return lang.startsWith("zh") ? "zh" : "en";
}

const dict = {
  // Header
  fileNumber: { en: "FILE NO. TNC-2024-KABOOM", zh: "档案编号 TNC-2024-KABOOM" },
  classification: { en: "UNCLASSIFIED // FOUO", zh: "非密 // 仅供官方使用" },

  // Hero
  topSecret: { en: "TOP SECRET — EYES ONLY", zh: "绝密 — 仅限阅览" },
  operationTitle: { en: "TOTALLY NOT\nCLASSIFIED", zh: "非机密\n导弹模拟器" },
  heroDesc: {
    en: "Monte Carlo simulation of missile force attrition under sustained air campaign pressure. Configure parameters, launch simulation, analyze results.",
    zh: "在持续空中打击压力下的导弹部队消耗蒙特卡洛仿真。配置参数，启动模拟，分析结果。",
  },
  heroJoke: {
    en: '"For educational purposes only. Probably."',
    zh: '"仅供教育用途。大概吧。"',
  },
  stampText: { en: "KABOOM", zh: "轰" },

  // Section C (params moved after results)
  sectionA: { en: "SECTION C — SIMULATION PARAMETERS", zh: "第三部分 — 仿真参数" },
  missionConfig: { en: "Mission Configuration", zh: "任务配置" },
  advancedParams: { en: "ADVANCED PARAMETERS", zh: "高级参数" },

  // Core params
  initialStock: { en: "Initial Stock", zh: "初始库存" },
  initialStockSub: { en: "Total missiles in inventory", zh: "导弹总库存量" },
  initialTels: { en: "Initial TELs", zh: "初始 TEL 数量" },
  initialTelsSub: { en: "Transporter Erector Launchers", zh: "运输起竖发射车" },
  day1Salvo: { en: "Day-1 Salvo", zh: "首日齐射量" },
  day1SalvoSub: { en: "Missiles launched on first day", zh: "首日发射导弹数" },
  telAttritionProb: { en: "TEL Attrition Prob", zh: "TEL 损耗概率" },
  telAttritionProbSub: { en: "Per-TEL daily kill probability", zh: "每辆 TEL 日摧毁概率" },
  days: { en: "Days", zh: "天数" },
  daysSub: { en: "Simulation duration", zh: "仿真持续时间" },
  monteCarloRuns: { en: "Monte Carlo Runs", zh: "蒙特卡洛运行次数" },
  monteCarloRunsSub: { en: "More runs = smoother confidence bands", zh: "次数越多 = 置信带越平滑" },

  // Advanced params
  dailyProduction: { en: "Daily Production", zh: "日产量" },
  dailyProductionSub: { en: "New missiles manufactured per day", zh: "每日新制造导弹数" },
  factoryDisruption: { en: "Factory Disruption", zh: "工厂破坏率" },
  factoryDisruptionSub: { en: "% of production capacity destroyed", zh: "被摧毁产能百分比" },
  tacticalDecay: { en: "Tactical Decay", zh: "战术衰减" },
  tacticalDecaySub: { en: "Daily salvo effectiveness multiplier", zh: "每日齐射效能乘数" },
  telReloadCapacity: { en: "TEL Reload Capacity", zh: "TEL 装填能力" },
  telReloadCapacitySub: { en: "Missiles per TEL per day", zh: "每辆 TEL 每日装填数" },

  // v2 params — C2, fuel type, proxy
  c2Integrity: { en: "C2 Integrity", zh: "C2 指挥完整度" },
  c2IntegritySub: { en: "Command chain effectiveness (0–1)", zh: "指挥链有效性（0–1）" },
  c2DecayRate: { en: "C2 Decay Rate", zh: "C2 衰减速率" },
  c2DecayRateSub: { en: "Daily C2 degradation", zh: "每日指挥能力衰减" },
  solidFuelRatio: { en: "Solid Fuel Ratio", zh: "固体燃料占比" },
  solidFuelRatioSub: { en: "Fraction of TELs using solid fuel", zh: "使用固体燃料的 TEL 比例" },
  proxySalvo: { en: "Proxy Salvo", zh: "代理人齐射" },
  proxySalvoSub: { en: "Daily missiles from proxy forces", zh: "代理人每日发射量" },
  proxyDecay: { en: "Proxy Decay", zh: "代理人衰减" },
  proxyDecaySub: { en: "Daily proxy fire decay multiplier", zh: "代理人火力每日衰减乘数" },

  // Scenario presets
  scenarioPresets: { en: "SCENARIO PRESETS", zh: "情境预设" },
  scenarioBaseline: { en: "Baseline", zh: "基线" },
  scenarioC2Collapse: { en: "C2 Collapse", zh: "C2 崩溃" },
  scenarioProxyShift: { en: "Proxy Shift", zh: "代理补偿" },

  // Buttons
  launchSim: { en: "LAUNCH SIMULATION", zh: "启动仿真" },
  runningSim: { en: "RUNNING SIMULATION...", zh: "仿真运行中..." },
  reset: { en: "RESET", zh: "重置" },
  runsCompleted: {
    en: (runs: number, ms: string) => `${runs} runs completed in ${ms}ms`,
    zh: (runs: number, ms: string) => `${runs} 次运行完成，耗时 ${ms}ms`,
  },

  // Section B — Results
  sectionB: { en: "SECTION A — ANALYSIS OUTPUT", zh: "第一部分 — 分析输出" },
  simResults: { en: "Simulation Results", zh: "仿真结果" },
  runsXDays: {
    en: (runs: number, d: number) => `(${runs} runs × ${d} days)`,
    zh: (runs: number, d: number) => `(${runs} 次运行 × ${d} 天)`,
  },

  // Stat cards
  sectionBStats: { en: "SECTION B — SUMMARY", zh: "第二部分 — 摘要" },
  finalSalvo: { en: "Final Salvo (Median)", zh: "最终齐射量（中位数）" },
  missilesPerDay: { en: "missiles/day", zh: "枚/天" },
  belowGuerilla: { en: "BELOW GUERILLA THRESHOLD", zh: "低于游击战阈值" },
  telSurvival: { en: "TEL Survival (Median)", zh: "TEL 存活数（中位数）" },
  operationalUnits: { en: "operational units", zh: "作战单位" },
  remainingStock: { en: "Remaining Stock (Median)", zh: "剩余库存（中位数）" },
  missiles: { en: "missiles", zh: "枚" },

  // Charts
  panel01: { en: "PANEL 01 — SALVO PROJECTION", zh: "图表 01 — 齐射预测" },
  dailyMissileSalvo: { en: "Daily Missile Salvo", zh: "每日导弹齐射量" },
  panel02: { en: "PANEL 02 — TEL SURVIVAL", zh: "图表 02 — TEL 存活率" },
  mobileLauncherDecay: { en: "Mobile Launcher Decay", zh: "移动发射车衰减" },
  panel03: { en: "PANEL 03 — INVENTORY", zh: "图表 03 — 库存" },
  totalStockAttrition: { en: "Total Missile Stock Attrition", zh: "导弹总库存消耗" },
  panel04: { en: "PANEL 04 — MODEL vs REALITY", zh: "图表 04 — 模型 vs 现实" },
  modelVsReality: { en: "Simulation vs Observed Launches", zh: "模拟 vs 实际发射量" },
  observed: { en: "Observed", zh: "实际观测" },
  simMedian: { en: "Sim Median", zh: "模拟中位数" },
  panel05: { en: "PANEL 05 — DEVIATION ANALYSIS", zh: "图表 05 — 偏差分析" },
  deviationByDay: { en: "Daily Deviation (Sim − Observed)", zh: "逐日偏差（模拟 − 实际）" },
  guerillaThreshold: { en: "Guerilla Threshold", zh: "游击战阈值" },
  today: { en: "Today", zh: "今天" },
  yesterday: { en: "Yesterday", zh: "昨天" },
  axisDay: { en: "Day", zh: "天" },
  axisMissilesPerDay: { en: "Missiles/Day", zh: "枚/天" },
  axisOperationalUnits: { en: "Operational Units", zh: "作战单位" },
  axisMissiles: { en: "Missiles", zh: "导弹数" },
  axisBias: { en: "Bias %", zh: "偏差 %" },
  metricStocks: { en: "Stocks", zh: "库存" },
  metricTels: { en: "TELs", zh: "TEL" },
  metricSalvos: { en: "Salvos", zh: "齐射" },

  // Declassify button & explanations
  declassify: { en: "DECLASSIFY", zh: "解密" },
  reclassify: { en: "RECLASSIFY", zh: "加密" },
  explainSalvo: {
    en: "Think of this like a water gun fight: on day 1, you have tons of water balloons to throw. But each day, the other side pops some of your launchers and you run low on ammo. The red line shows how many missiles get fired each day on average. The orange band shows the range of possibilities — sometimes you're lucky, sometimes not. When the line drops below the dashed \"guerilla threshold\", the missile force is basically out of action.",
    zh: "想象一场水气球大战：第一天你有超多水气球可以扔。但每天对方都会戳破你一些发射器，弹药也在减少。红线表示每天平均能发射多少导弹。橙色区域表示可能的范围——有时运气好，有时运气差。当红线掉到虚线「游击战阈值」以下时，导弹部队基本就废了。",
  },
  explainTel: {
    en: "TELs are the big trucks that carry and launch missiles — think of them as your \"lives\" in a video game. Every day, there's a chance each truck gets found and destroyed. The blue line shows how many survive on average. The shaded area shows best-case and worst-case scenarios. Once you lose all your trucks, it doesn't matter how many missiles you have left — you can't fire them.",
    zh: "TEL 就是那种能装载和发射导弹的大卡车——把它们想象成游戏里的「命」。每天，每辆车都有一定概率被发现并摧毁。蓝线表示平均还剩多少辆。阴影区域表示最好和最差的情况。一旦卡车全没了，就算还有导弹也发射不了。",
  },
  explainStock: {
    en: "This is your \"ammo counter\". You start with a big pile of missiles, and every day you fire some and (maybe) build a few new ones. The green line shows the average remaining inventory. The dashed lines above and below show the optimistic and pessimistic scenarios. When it hits zero, game over — no more missiles to fire.",
    zh: "这就是你的「弹药计数器」。一开始你有一大堆导弹，每天发射一些，（也许）再造几枚新的。绿线表示平均剩余库存。上下虚线分别是乐观和悲观的情况。当库存归零，游戏结束——没导弹可发了。",
  },
  explainModelVsReality: {
    en: "The red dots are what actually happened in the real conflict (from news reports and military briefings). The line is what our simulation predicted. When the dots track the line closely, it means the model is doing a good job of capturing reality. Big gaps mean something in the real world is different from our assumptions.",
    zh: "红点是真实冲突中实际发生的情况（来自新闻报道和军方简报）。线条是我们模拟的预测。当红点紧贴线条时，说明模型很好地还原了现实。如果差距很大，说明现实中有些因素和我们的假设不同。",
  },
  explainDeviation: {
    en: "This chart shows the daily \"error\" of the simulation — how many more (or fewer) missiles the model predicted compared to what actually happened. Bars above zero mean the model overestimated, bars below mean it underestimated. If most bars are small, the model is well-calibrated. Big bars on certain days suggest unexpected events (like a surge in attacks or a major launcher strike).",
    zh: "这张图展示模拟的逐日「误差」——模型预测的发射量比实际多了（或少了）多少。柱子在零线上方说明模型高估了，下方说明低估了。如果大多数柱子都很小，说明模型校准得好。某些天出现大柱子，说明那天有意外事件（比如攻击激增或发射车被大规模摧毁）。",
  },

  // Anti-war
  antiwarFooterQuote: {
    en: "The living know that they will die, so make art, not war",
    zh: "生者知其必死，故以艺术代替战争",
  },

  // Footer
  footerLine1: {
    en: "TOTALLY NOT CLASSIFIED — Any resemblance to actual military intelligence is purely coincidental.",
    zh: "完全不是机密 — 与真实军事情报的任何相似之处纯属巧合。",
  },
  footerLine2: {
    en: "If you are from any three-letter agency, we were just kidding.",
    zh: "如果您来自某个三个字母的机构，我们只是开个玩笑。",
  },
} as const;

export type TransKey = keyof typeof dict;

export type Translations = {
  [K in TransKey]: (typeof dict)[K]["en"];
};

export function getTranslations(locale: Locale): Translations {
  const result = {} as Record<string, unknown>;
  for (const key in dict) {
    result[key] = dict[key as TransKey][locale];
  }
  return result as Translations;
}

export const LocaleContext = createContext<{
  locale: Locale;
  t: Translations;
}>({
  locale: "en",
  t: getTranslations("en"),
});

export function useLocale() {
  return useContext(LocaleContext);
}
