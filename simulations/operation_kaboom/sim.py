"""
OPERATION KABOOM — Missile Force Attrition Simulator
=====================================================
A *totally fictional* Monte Carlo model simulating the degradation
of a hypothetical nation's ballistic missile strike capability
under sustained coalition air campaign pressure.

v2: Integrates C2 disruption, solid/liquid fuel differentiation,
    and proxy force compensation from DDEM v3.1 assessment data.

Classification: UNCLASSIFIED // FOUO (For Oddity Use Only)
"""

import numpy as np
import matplotlib.pyplot as plt
from pathlib import Path


class MissileForceSimulator:
    """
    Dynamic prediction model for missile force attrition.

    Core mechanics:
    1. Inventory depletes via launch consumption, partially offset by production.
    2. Strike bandwidth is bottlenecked by surviving TEL (Transporter Erector Launcher) count.
    3. Stochastic disruption via binomial TEL attrition models ISR/strike randomness.
    4. C2 (Command & Control) integrity degrades launch authorization independently.
    5. Solid-fuel TELs survive at higher rates than liquid-fuel TELs (shoot-and-scoot vs fueling window).
    6. Proxy forces provide additive fire compensation with their own decay curve.
    """

    def __init__(
        self,
        initial_stock: int = 2500,
        initial_tels: int = 125,
        daily_production: float = 10,
        day1_salvo: int = 150,
        tel_attrition_prob: float = 0.12,
        factory_disruption: float = 0.95,
        tactical_decay: float = 0.85,
        tel_reload_capacity: float = 1.5,
        # --- v2 parameters (from DDEM v3.1 assessment) ---
        c2_integrity: float = 1.0,
        c2_decay_rate: float = 0.0,
        solid_fuel_ratio: float = 0.6,
        solid_tel_attrition_prob: float | None = None,
        liquid_tel_attrition_prob: float | None = None,
        proxy_salvo: float = 0.0,
        proxy_decay: float = 0.95,
    ):
        self.initial_stock = initial_stock
        self.initial_tels = initial_tels
        self.daily_production = daily_production
        self.day1_salvo = day1_salvo
        self.tel_attrition_prob = tel_attrition_prob
        self.factory_disruption = factory_disruption
        self.tactical_decay = tactical_decay
        self.tel_reload_capacity = tel_reload_capacity

        # C2 integrity: fraction of launch orders that actually reach TEL crews.
        # Degrades daily by c2_decay_rate (e.g., after leadership decapitation).
        self.c2_integrity = c2_integrity
        self.c2_decay_rate = c2_decay_rate

        # Solid-fuel TELs (e.g., Fateh-110) have lower attrition (fast launch, no fueling window).
        # Liquid-fuel TELs (e.g., Shahab/Emad) are vulnerable during 30-60 min fueling.
        self.solid_fuel_ratio = solid_fuel_ratio
        self.solid_tel_attrition_prob = (
            solid_tel_attrition_prob if solid_tel_attrition_prob is not None
            else tel_attrition_prob * 0.5
        )
        self.liquid_tel_attrition_prob = (
            liquid_tel_attrition_prob if liquid_tel_attrition_prob is not None
            else tel_attrition_prob * 1.8
        )

        # Proxy forces (e.g., Hezbollah/Houthi) provide additive daily salvos
        # with their own decay rate, independent of domestic TEL/stock constraints.
        self.proxy_salvo = proxy_salvo
        self.proxy_decay = proxy_decay

    def run(self, days: int = 30, runs: int = 1000) -> dict:
        """Run Monte Carlo simulation. Returns dict of (runs x days) arrays."""
        all_stocks = np.zeros((runs, days))
        all_tels = np.zeros((runs, days))
        all_salvos = np.zeros((runs, days))

        effective_production = self.daily_production * (1 - self.factory_disruption)

        for r in range(runs):
            stock = float(self.initial_stock)
            # Split TELs into solid- and liquid-fuel fleets
            solid_tels = int(self.initial_tels * self.solid_fuel_ratio)
            liquid_tels = self.initial_tels - solid_tels
            tels = solid_tels + liquid_tels
            salvo = float(self.day1_salvo)
            c2 = self.c2_integrity
            proxy = self.proxy_salvo

            all_stocks[r, 0] = stock
            all_tels[r, 0] = tels
            all_salvos[r, 0] = salvo + proxy

            for d in range(1, days):
                # C2 degrades each day (leadership vacuum, comm disruption)
                c2 = max(0.0, c2 - self.c2_decay_rate)

                # TEL attrition — solid and liquid fleets degrade at different rates
                solid_lost = np.random.binomial(solid_tels, self.solid_tel_attrition_prob)
                liquid_lost = np.random.binomial(liquid_tels, self.liquid_tel_attrition_prob)
                solid_tels = max(0, solid_tels - solid_lost)
                liquid_tels = max(0, liquid_tels - liquid_lost)
                tels = solid_tels + liquid_tels

                # Intended launch decays tactically, then gated by C2 integrity
                intended = salvo * self.tactical_decay * c2
                # Actual launch capped by stock and TEL reload capacity
                salvo = min(stock, tels * self.tel_reload_capacity, intended)

                # Proxy fire compensation (independent of domestic constraints)
                proxy = proxy * self.proxy_decay

                stock = stock - salvo + effective_production

                all_stocks[r, d] = stock
                all_tels[r, d] = tels
                all_salvos[r, d] = salvo + proxy

        return {"stocks": all_stocks, "tels": all_tels, "salvos": all_salvos}

    def deviation_report(self, sim: dict, observed: dict, day: int = 10) -> dict:
        """Compare simulation median at given day against observed ground truth."""
        report = {}
        for key in observed:
            median = np.median(sim[key][:, day])
            truth = observed[key]
            report[key] = {
                "median": median,
                "observed": truth,
                "bias": (median - truth) / truth,
            }
        return report


def plot_results(sim: dict, days: int, bias: dict | None = None, save_path: str | None = None):
    """Generate the 4-panel analysis chart."""
    time_axis = np.arange(days)
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))

    # Panel 1: Salvo bandwidth decay
    ax = axes[0, 0]
    ax.fill_between(
        time_axis,
        np.percentile(sim["salvos"], 25, axis=0),
        np.percentile(sim["salvos"], 75, axis=0),
        alpha=0.3, color="orange", label="50% CI",
    )
    ax.plot(time_axis, np.median(sim["salvos"], axis=0), color="red", lw=2, label="Median")
    ax.axhline(y=10, color="gray", ls="--", label="Guerilla Threshold")
    ax.set_title("Daily Missile Salvo Projection")
    ax.set_ylabel("Missiles / Day")
    ax.legend()
    ax.grid(True, alpha=0.3)

    # Panel 2: TEL survival
    ax = axes[0, 1]
    ax.plot(time_axis, np.median(sim["tels"], axis=0), color="blue", label="TEL Survival")
    ax.fill_between(time_axis, np.min(sim["tels"], axis=0), np.max(sim["tels"], axis=0), alpha=0.1, color="blue")
    ax.set_title("TEL Mobile Launcher Survival Decay")
    ax.set_ylabel("Operational Units")
    ax.grid(True, alpha=0.3)

    # Panel 3: Stock attrition
    ax = axes[1, 0]
    ax.plot(time_axis, np.median(sim["stocks"], axis=0), color="green", label="Inventory")
    ax.set_title("Total Missile Stock Attrition")
    ax.set_ylabel("Number of Missiles")
    ax.grid(True, alpha=0.3)

    # Panel 4: Deviation analysis
    ax = axes[1, 1]
    if bias:
        metrics = list(bias.keys())
        values = [bias[k]["bias"] for k in metrics]
        colors = ["red" if abs(v) > 0.1 else "green" for v in values]
        ax.bar(metrics, values, color=colors)
        ax.axhline(y=0, color="black", ls="-")
        ax.set_ylim(-0.5, 0.5)
    ax.set_title("Model Deviation Analysis (vs Ground Truth)")
    ax.set_ylabel("Bias (%)")

    fig.tight_layout()

    if save_path:
        fig.savefig(save_path, dpi=150)
        print(f"Chart saved to {save_path}")

    plt.show()


def main():
    days = 21

    # --- Scenario presets from DDEM v3.1 assessment ---
    scenarios = {
        "baseline": MissileForceSimulator(),
        "c2_collapse": MissileForceSimulator(
            c2_integrity=0.34,
            c2_decay_rate=0.04,
            solid_fuel_ratio=0.6,
        ),
        "proxy_shift": MissileForceSimulator(
            c2_integrity=0.50,
            c2_decay_rate=0.02,
            proxy_salvo=20.0,
            proxy_decay=0.92,
        ),
    }

    output_dir = Path(__file__).parent / "output"
    output_dir.mkdir(exist_ok=True)

    # Hypothetical Day 10 observation for deviation analysis
    observed = {"stocks": 1920, "tels": 35, "salvos": 38}

    for name, sim in scenarios.items():
        results = sim.run(days=days)
        bias = sim.deviation_report(results, observed, day=10)

        print("=" * 50)
        print(f"OPERATION KABOOM — {name.upper()} Scenario")
        print("=" * 50)
        for key, info in bias.items():
            print(f"  {key:>8s}: median={info['median']:.1f}  observed={info['observed']}  bias={info['bias']:+.2%}")
        print()

        plot_results(results, days, bias, save_path=str(output_dir / f"kaboom_{name}.png"))


if __name__ == "__main__":
    main()
