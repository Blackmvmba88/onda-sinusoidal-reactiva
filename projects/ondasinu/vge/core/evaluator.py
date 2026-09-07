"""Evaluation layer for VGE simulation runs."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class EvaluationReport:
    """Human-readable run health summary."""

    stable: bool
    convergence: float
    anomaly: bool
    reason: str


def evaluate_costs(costs: list[float]) -> EvaluationReport:
    """Evaluate stability and convergence from a cost series."""

    if not costs:
        return EvaluationReport(
            stable=False,
            convergence=0.0,
            anomaly=True,
            reason="no cost samples were produced",
        )

    first = costs[0]
    last = costs[-1]
    convergence = first - last
    finite = all(cost == cost and cost not in (float("inf"), float("-inf")) for cost in costs)
    stable = finite and (last <= first or abs(convergence) < 1e-9)
    anomaly = not finite

    if anomaly:
        reason = "non-finite cost detected"
    elif stable:
        reason = "cost remained stable or improved"
    else:
        reason = "cost increased during run"

    return EvaluationReport(
        stable=stable,
        convergence=convergence,
        anomaly=anomaly,
        reason=reason,
    )
