"""Simulation loop for VGE Engine."""

from __future__ import annotations

from dataclasses import dataclass

from vge.core.cost import CostReport, score_state
from vge.core.dynamics import DynamicsConfig, step_state
from vge.core.evaluator import EvaluationReport, evaluate_costs
from vge.core.state import EngineState


@dataclass(frozen=True)
class RunReport:
    """Complete output from one VGE run."""

    initial_state: EngineState
    final_state: EngineState
    costs: tuple[CostReport, ...]
    evaluation: EvaluationReport

    def to_dict(self) -> dict[str, object]:
        return {
            "initial_state": self.initial_state.to_dict(),
            "final_state": self.final_state.to_dict(),
            "costs": [
                {"total_cost": cost.total_cost, "terms": cost.terms}
                for cost in self.costs
            ],
            "evaluation": {
                "stable": self.evaluation.stable,
                "convergence": self.evaluation.convergence,
                "anomaly": self.evaluation.anomaly,
                "reason": self.evaluation.reason,
            },
        }


def run_simulation(
    initial_state: EngineState | None = None,
    steps: int = 100,
    config: DynamicsConfig | None = None,
) -> RunReport:
    """Run a deterministic simulation and return an explainable report."""

    if steps < 0:
        raise ValueError("steps must be >= 0")

    state = initial_state or EngineState(
        positions=((5.0, 0.0),),
        velocities=((0.0, 0.0),),
        field=(1.0,),
        constraints={"boundary": 10.0},
    )

    initial = state
    costs: list[CostReport] = [score_state(state)]

    for _ in range(steps):
        state = step_state(state, config=config)
        costs.append(score_state(state))

    evaluation = evaluate_costs([cost.total_cost for cost in costs])
    return RunReport(
        initial_state=initial,
        final_state=state,
        costs=tuple(costs),
        evaluation=evaluation,
    )
