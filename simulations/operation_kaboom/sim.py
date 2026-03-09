"""
OPERATION KABOOM — Missile Force Attrition Simulator
=====================================================
A *totally fictional* Monte Carlo model simulating the degradation
of a hypothetical nation's ballistic missile strike capability
under sustained coalition air campaign pressure.

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
    ):
        self.initial_stock = initial_stock
        self.initial_tels = initial_tels
        self.daily_production = daily_production
        self.day1_salvo = day1_salvo
        self.tel_attrition_prob = tel_attrition_prob
        self.factory_disruption = factory_disruption
        self.tactical_decay = tactical_decay
        self.tel_reload_capacity = tel_reload_capacity

    def run(self, days: int = 30, runs: int = 1000) -> dict:
        """Run Monte Carlo simulation. Returns dict of (runs x days) arrays."""
        all_stocks = np.zeros((runs, days))
        all_tels = np.zeros((runs, days))
        all_salvos = np.zeros((runs, days))

        effective_production = self.daily_production * (1 - self.factory_disruption)

        for r in range(runs):
            stock = self.initial_stock
            tels = self.initial_tels
            salvo = self.day1_salvo

            all_stocks[r, 0] = stock
            all_tels[r, 0] = tels
            all_salvos[r, 0] = salvo

            for d in range(1, days):
                # TEL attrition (binomial — each TEL independently targeted)
                lost = np.random.binomial(tels, self.tel_attrition_prob)
                tels = max(0, tels - lost)

                # Intended launch decays tactically each day
                intended = salvo * self.tactical_decay
                # Actual launch capped by stock and TEL reload capacity
                salvo = min(stock, tels * self.tel_reload_capacity, intended)

                stock = stock - salvo + effective_production

                all_stocks[r, d] = stock
                all_tels[r, d] = tels
                all_salvos[r, d] = salvo

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
    sim = MissileForceSimulator()
    days = 21
    results = sim.run(days=days)

    # Hypothetical Day 10 observation for deviation analysis
    observed = {"stocks": 1920, "tels": 35, "salvos": 38}
    bias = sim.deviation_report(results, observed, day=10)

    print("=" * 50)
    print("OPERATION KABOOM — Deviation Report")
    print("=" * 50)
    for key, info in bias.items():
        print(f"  {key:>8s}: median={info['median']:.1f}  observed={info['observed']}  bias={info['bias']:+.2%}")
    print("=" * 50)

    output_dir = Path(__file__).parent / "output"
    output_dir.mkdir(exist_ok=True)
    plot_results(results, days, bias, save_path=str(output_dir / "kaboom_report.png"))


if __name__ == "__main__":
    main()
