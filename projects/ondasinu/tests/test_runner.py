from vge.core.runner import run_simulation
from vge.core.state import EngineState


def test_run_is_deterministic() -> None:
    state = EngineState(
        positions=((5.0, 0.0),),
        velocities=((0.0, 0.0),),
        field=(1.0,),
        constraints={"boundary": 10.0},
        seed=42,
    )

    first = run_simulation(state, steps=20).to_dict()
    second = run_simulation(state, steps=20).to_dict()

    assert first == second


def test_cost_report_is_explainable() -> None:
    report = run_simulation(steps=5)
    latest = report.costs[-1]

    assert latest.total_cost >= 0
    assert "smoothness" in latest.terms
    assert "objective_distance" in latest.terms
    assert report.evaluation.reason
