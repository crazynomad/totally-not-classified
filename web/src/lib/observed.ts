/**
 * Observed data from the 2026 Iran conflict (Feb 28 – ongoing).
 *
 * Sources (cross-referenced):
 * - UAE Ministry of Defense daily reports
 * - Kan 11 (Israeli broadcasting) daily tallies
 * - IDF spokesperson briefings
 * - JPost, FDD/Long War Journal, JINSA, Critical Threats, Alma Center
 *
 * NOTE: Numbers are approximate and compiled from open-source reporting.
 * Different sources report slightly different figures depending on what
 * they count (all targets vs Israel-only vs UAE-only). We use the best
 * available composite estimates for total ballistic missile launches.
 *
 * TEL counts are cumulative surviving, derived from:
 * - Initial fleet: ~450 mobile TELs (midpoint of 400-550 range)
 * - IDF reported ~300 destroyed/disabled by Day 3 (Mar 3)
 * - 65% destroyed by Day 5, 75% by Day 7
 */

export interface ObservedDay {
  day: number;
  date: string;       // M/D format
  salvos: number;     // ballistic missiles launched that day
  tels: number;       // estimated surviving mobile TELs (end of day)
  stocks: number;     // estimated remaining MRBM stockpile
  source: string;     // primary source note
}

// War start: Feb 28, 2026 = Day 0
// Initial conditions: ~2000 MRBMs, ~450 mobile TELs
export const OBSERVED_DATA: ObservedDay[] = [
  { day: 0,  date: "2/28", salvos: 137, tels: 350, stocks: 1863, source: "UAE MoD: 137 BMs at UAE; Kan11: 90 at Israel" },
  { day: 1,  date: "3/1",  salvos: 65,  tels: 280, stocks: 1798, source: "Kan11; most intense attack waves (64 waves)" },
  { day: 2,  date: "3/2",  salvos: 25,  tels: 200, stocks: 1773, source: "Kan11: 25; UAE MoD: 9 at UAE" },
  { day: 3,  date: "3/3",  salvos: 20,  tels: 150, stocks: 1753, source: "Kan11: 20; IDF: ~300 launchers destroyed by now" },
  { day: 4,  date: "3/4",  salvos: 12,  tels: 135, stocks: 1741, source: "UAE MoD: 3 at UAE; ~7 attack waves" },
  { day: 5,  date: "3/5",  salvos: 15,  tels: 120, stocks: 1726, source: "Alma: 11 waves; ~65% TELs lost" },
  { day: 6,  date: "3/6",  salvos: 10,  tels: 115, stocks: 1716, source: "IRGC 23rd wave; UAE intercepted 9 BMs" },
  { day: 7,  date: "3/7",  salvos: 8,   tels: 112, stocks: 1708, source: "JPost: <15, near 10; 75% TELs destroyed" },
  { day: 8,  date: "3/8",  salvos: 9,   tels: 110, stocks: 1699, source: "ToI: 9 salvos at Israel; new Supreme Leader" },
  { day: 9,  date: "3/9",  salvos: 6,   tels: 108, stocks: 1693, source: "Estimated from trend; 90% decline from Day 0" },
];

/** Initial values (Day 0, pre-war) */
export const OBSERVED_INITIAL = {
  stocks: 2000,
  tels: 450,
  day1Salvo: 137,
};
