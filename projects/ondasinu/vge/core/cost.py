"""Cost / action scoring for VGE trajectories."""

from __future__ import annotations

import math
from dataclasses import dataclass

from vge.core.state import EngineState


@dataclass(frozen=True)
class CostReport:
    """Explainable cost result for one state."""

    total_cost: float
    terms: dict[str, float]


def score_state(state: EngineState) -> CostReport:
    """Score a state with separate explainable cost terms."""

    velocity_norm = sum(math.hypot(vx, vy) for vx, vy in state.velocities)
    objective_distance = sum(math.hypot(px, py) for px, py in state.positions)
    field_energy = sum(abs(value) for value in state.field)
    boundary = float(state.constraints.get("boundary", 10.0))
    constraint_violation = sum(
        1.0
        for px, py in state.positions
        if abs(px) >= boundary or abs(py) >= boundary
    )

    terms = {
        "smoothness": velocity_norm,
        "objective_distance": objective_distance,
        "field_energy": field_energy,
        "constraint_violation": constraint_violation,
    }
    total = sum(terms.values())
    return CostReport(total_cost=total, terms=terms)
