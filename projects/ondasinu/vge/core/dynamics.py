"""Explicit deterministic transition rules for VGE Engine."""

from __future__ import annotations

import math
import random
from dataclasses import dataclass

from vge.core.state import EngineState, Vector2


@dataclass(frozen=True)
class DynamicsConfig:
    """Visible parameters for one simulation transition."""

    attraction: float = 0.08
    damping: float = 0.96
    noise: float = 0.0
    boundary: float = 10.0


def _clamp(value: float, lower: float, upper: float) -> float:
    return max(lower, min(upper, value))


def _towards_origin(position: Vector2) -> Vector2:
    x, y = position
    distance = math.hypot(x, y)
    if distance == 0:
        return (0.0, 0.0)
    return (-x / distance, -y / distance)


def step_state(state: EngineState, config: DynamicsConfig | None = None) -> EngineState:
    """Advance the state by one explicit transition.

    The same input state and config always produce the same output state.
    Noise is deterministic because it is seeded from the state seed and step.
    """

    config = config or DynamicsConfig()
    rng = random.Random(state.seed + state.step)

    next_positions: list[Vector2] = []
    next_velocities: list[Vector2] = []

    for position, velocity in zip(state.positions, state.velocities, strict=True):
        direction = _towards_origin(position)
        noise_x = rng.uniform(-config.noise, config.noise)
        noise_y = rng.uniform(-config.noise, config.noise)

        vx = (velocity[0] + direction[0] * config.attraction + noise_x) * config.damping
        vy = (velocity[1] + direction[1] * config.attraction + noise_y) * config.damping

        px = _clamp(position[0] + vx * state.dt, -config.boundary, config.boundary)
        py = _clamp(position[1] + vy * state.dt, -config.boundary, config.boundary)

        next_positions.append((px, py))
        next_velocities.append((vx, vy))

    next_field = tuple(value * config.damping for value in state.field)

    return EngineState(
        step=state.step + 1,
        dt=state.dt,
        positions=tuple(next_positions),
        velocities=tuple(next_velocities),
        field=next_field,
        constraints=state.constraints,
        seed=state.seed,
    )
