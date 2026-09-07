"""ASCII terminal rendering for VGE Engine."""

from __future__ import annotations

from vge.core.runner import RunReport
from vge.core.state import EngineState


def render_state(state: EngineState, width: int = 25, height: int = 9) -> str:
    """Render positions into a small ASCII field."""

    boundary = float(state.constraints.get("boundary", 10.0))
    grid = [[" " for _ in range(width)] for _ in range(height)]

    for index, (x, y) in enumerate(state.positions):
        col = round(((x + boundary) / (2 * boundary)) * (width - 1))
        row = round(((boundary - y) / (2 * boundary)) * (height - 1))
        if 0 <= row < height and 0 <= col < width:
            grid[row][col] = "@" if index == 0 else "o"

    top = "+" + "-" * width + "+"
    rows = ["|" + "".join(row) + "|" for row in grid]
    return "\n".join([top, *rows, top])


def render_report(report: RunReport) -> str:
    """Render a compact human-readable report."""

    latest_cost = report.costs[-1].total_cost
    evaluation = report.evaluation
    return "\n".join(
        [
            "VGE RUN",
            f"step: {report.final_state.step}",
            f"cost: {latest_cost:.6f}",
            f"stable: {evaluation.stable}",
            f"convergence: {evaluation.convergence:.6f}",
            f"reason: {evaluation.reason}",
            "",
            render_state(report.final_state),
        ]
    )
