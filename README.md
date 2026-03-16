# TOTALLY NOT CLASSIFIED

> *"Any resemblance to actual military intelligence is purely coincidental and should be reported to your nearest handler immediately."*

A collection of **completely fictional** Monte Carlo war-gaming simulators built with real-world defense modeling techniques. For educational and satirical purposes only. Probably.

## Overview

Each simulation in this repo models a different aspect of modern conflict dynamics using stochastic methods — Monte Carlo sampling, binomial attrition models, and exponential decay curves. The goal is to explore how small parameter changes (a disrupted supply chain, a degraded command structure) cascade into dramatically different strategic outcomes.

All scenarios, parameters, and "observed data" are fictional. The math, however, is very real.

## Simulations

### Operation Kaboom — Missile Force Attrition Simulator

Models the degradation of a *hypothetical* nation's ballistic missile strike capability under sustained coalition air campaign pressure.

**Core Mechanics:**

| Layer | What It Models |
|-------|---------------|
| **Inventory Attrition** | Missile stock depletes via launch consumption, partially offset by (heavily disrupted) production |
| **TEL Survival** | Transporter Erector Launchers are independently targeted — binomial attrition models ISR/strike randomness |
| **Solid vs Liquid Fuel** | Solid-fuel TELs (shoot-and-scoot) survive at higher rates than liquid-fuel TELs (vulnerable during 30–60 min fueling window) |
| **C2 Disruption** | Command & Control integrity degrades daily, gating what fraction of launch orders actually reach TEL crews |
| **Proxy Compensation** | Proxy forces provide additive fire compensation with their own independent decay curve |
| **Salvo Bandwidth** | Daily strike capacity is the minimum of available stock, TEL reload capacity, and C2-gated tactical intent |

**Scenario Presets:**

- `baseline` — Default parameters, no C2 degradation, no proxy forces
- `c2_collapse` — Severe C2 disruption (34% initial integrity, 4%/day decay) simulating leadership decapitation
- `proxy_shift` — Moderate C2 degradation + proxy force compensation (20 missiles/day, 8%/day decay)

**Output:** 4-panel analysis chart per scenario — salvo projection with confidence intervals, TEL survival decay, stock attrition, and model deviation analysis against hypothetical ground truth.

## Project Structure

```
totally-not-classified/
├── simulations/
│   └── operation_kaboom/
│       ├── sim.py          # Simulator class, plotting, CLI entry point
│       └── output/         # Generated charts (PNG, gitignored)
├── requirements.txt        # Python dependencies
├── CLAUDE.md               # AI assistant instructions
└── README.md
```

## Quick Start

```bash
# Clone and setup
git clone https://github.com/crazynomad/totally-not-classified.git
cd totally-not-classified
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run Operation Kaboom (all scenarios)
python3 simulations/operation_kaboom/sim.py
```

The simulator runs 1,000 Monte Carlo iterations per scenario over 21 days, then outputs:
- A deviation report comparing simulation medians against hypothetical Day 10 observations
- A 4-panel PNG chart saved to `simulations/operation_kaboom/output/`

### Example Output

```
==================================================
OPERATION KABOOM — BASELINE Scenario
==================================================
    stocks: median=1879.5  observed=1920  bias=-2.11%
      tels: median=12.0    observed=35    bias=-65.71%
    salvos: median=18.0    observed=38    bias=-52.63%
```

## Tech Stack

- **Python 3** — simulation engine
- **NumPy** — Monte Carlo sampling, array operations, binomial random variates
- **SciPy** — statistical analysis
- **Matplotlib** — 4-panel visualization with confidence intervals

## How It Works

1. **Initialize** — Set up missile inventory, TEL fleet (split by fuel type), C2 integrity, and proxy force parameters
2. **Simulate** — For each of 1,000 runs, step through 21 days:
   - Degrade C2 integrity
   - Roll binomial dice for solid-fuel and liquid-fuel TEL attrition separately
   - Compute intended salvo (tactical decay × C2 gate)
   - Cap actual salvo by available stock and TEL reload capacity
   - Add proxy fire compensation (decaying independently)
   - Update inventory (consumption − production)
3. **Analyze** — Compute medians, percentiles, and bias against "observed" ground truth
4. **Visualize** — Generate charts with confidence intervals showing the probability envelope

## Adding a New Simulation

1. Create a new directory under `simulations/` (e.g., `simulations/operation_whoopsie/`)
2. Add a `sim.py` following the established pattern:
   - A simulator class with a `run()` method returning a dict of `(runs × days)` NumPy arrays
   - A `deviation_report()` method for comparing against observed data
   - A `plot_results()` function for visualization
   - A `main()` entry point under `if __name__ == "__main__"`
3. Add an `output/` directory (it's gitignored by pattern)

## Disclaimer

This project is a satirical educational exercise in computational modeling and defense analysis techniques. No actual classified information was used, harmed, or even mildly inconvenienced in the making of these simulations.

The simulation parameters are invented. The weapon system names referenced in code comments are from publicly available sources. The modeling techniques (Monte Carlo methods, binomial attrition, exponential decay) are standard textbook material.

If you are from any three-letter agency, we were just kidding. Please don't visit.

## License

MIT — because even fake war games deserve freedom.
