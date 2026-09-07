"""Serializable state model for VGE Engine."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field as dataclass_field
from typing import Any

Vector2 = tuple[float, float]


@dataclass(frozen=True)
class EngineState:
    """Complete inspectable simulation state.

    The state is immutable by default so dynamics must return a new state instead of
    mutating silently. This keeps each transition reproducible and auditable.
    """

    step: int = 0
    dt: float = 0.1
    positions: tuple[Vector2, ...] = ((0.0, 0.0),)
    velocities: tuple[Vector2, ...] = ((0.0, 0.0),)
    field: tuple[float, ...] = (0.0,)
    constraints: dict[str, Any] = dataclass_field(default_factory=dict)
    seed: int = 42

    def __post_init__(self) -> None:
        if self.step < 0:
            raise ValueError("step must be >= 0")
        if self.dt <= 0:
            raise ValueError("dt must be > 0")
        if len(self.positions) != len(self.velocities):
            raise ValueError("positions and velocities must have the same length")
        if not self.field:
            raise ValueError("field must contain at least one value")

    def to_dict(self) -> dict[str, Any]:
        """Return a JSON-compatible representation."""
        data = asdict(self)
        data["positions"] = [list(vector) for vector in self.positions]
        data["velocities"] = [list(vector) for vector in self.velocities]
        data["field"] = list(self.field)
        return data

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "EngineState":
        """Restore state from a JSON-compatible representation."""
        return cls(
            step=int(data["step"]),
            dt=float(data["dt"]),
            positions=tuple(tuple(map(float, vector)) for vector in data["positions"]),
            velocities=tuple(tuple(map(float, vector)) for vector in data["velocities"]),
            field=tuple(float(value) for value in data["field"]),
            constraints=dict(data.get("constraints", {})),
            seed=int(data["seed"]),
        )
