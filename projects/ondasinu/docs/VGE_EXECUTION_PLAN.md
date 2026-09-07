# VGE Execution Plan

This document turns the VGE Engine intent into an executable engineering roadmap.

VGE is a terminal-first simulation and optimization engine for explicit state dynamics, cost evaluation, feedback, and visualization. The goal is not to claim physical propulsion or hidden energy behavior. The goal is to build a measurable digital engine where every state transition can be inspected, reproduced, scored, and improved.

---

## Execution Rules

```txt
No hidden state.
No unverifiable variables.
No silent failure.
No metaphysical dependencies.
No physical propulsion claims.
Every run must be reproducible.
Every metric must be explainable.
Every module must be testable.
```

---

## Target Architecture

```txt
vge/
├── core/
│   ├── state.py          # Serializable engine state
│   ├── dynamics.py       # Explicit transition rules
│   ├── cost.py           # Action / cost scoring
│   ├── evaluator.py      # Stability and convergence checks
│   └── runner.py         # Simulation loop
├── viz/
│   └── terminal.py       # ANSI / ASCII instrumentation
├── experiments/
│   └── presets.py        # Reproducible initial conditions
├── cli.py                # Terminal interface
└── types.py              # Shared dataclasses / schemas

tests/
├── test_state.py
├── test_dynamics.py
├── test_cost.py
├── test_evaluator.py
└── test_reproducibility.py
```

---

## Milestone 0 — Repository Foundation

**Goal:** make the repo installable, testable, and runnable.

### Deliverables

- `pyproject.toml`
- package folder: `vge/`
- test folder: `tests/`
- CLI command: `vge`
- minimal CI workflow
- deterministic random seed support

### Done When

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
pytest
vge --help
```

---

## Milestone 1 — State Engine

**Goal:** define a complete, inspectable, serializable simulation state.

### State Requirements

The state must include:

- simulation step
- time delta
- positions
- velocities
- scalar field values
- constraints
- metadata
- random seed

### Suggested Interface

```python
from dataclasses import dataclass
from typing import Any

@dataclass(frozen=True)
class EngineState:
    step: int
    dt: float
    positions: list[tuple[float, float]]
    velocities: list[tuple[float, float]]
    field: list[float]
    constraints: dict[str, Any]
    seed: int
```

### Done When

- state can be serialized to JSON
- state can be restored exactly
- invalid state raises explicit errors
- reproducibility test passes

---

## Milestone 2 — Dynamics Module

**Goal:** implement explicit state transitions.

### Initial Dynamics

- attraction
- repulsion
- damping
- boundary constraints
- stochastic noise with seed control

### Rules

Each dynamic must expose:

```txt
name
parameters
input state
output state
metrics
```

### Done When

- each dynamic has unit tests
- each parameter is visible
- no dynamic mutates state silently
- same seed produces same trajectory

---

## Milestone 3 — Cost / Action Core

**Goal:** score trajectories by measurable criteria.

### Cost Terms

- smoothness
- stability
- distance to objective
- constraint violations
- oscillation penalty
- energy-like abstract penalty

### Suggested Output

```python
{
    "total_cost": 0.0,
    "terms": {
        "smoothness": 0.0,
        "stability": 0.0,
        "objective_distance": 0.0,
        "constraint_violation": 0.0,
        "oscillation": 0.0,
    }
}
```

### Done When

- cost can explain why trajectory A beats trajectory B
- all terms are logged separately
- cost is deterministic for identical input

---

## Milestone 4 — Evaluator

**Goal:** detect convergence, instability, anomalies, and silent failure.

### Metrics

- convergence rate
- average cost
- cost delta
- velocity norm
- field variance
- constraint violation count
- anomaly flag

### Done When

- evaluator can stop unstable runs
- evaluator produces a run report
- failing conditions are human-readable

---

## Milestone 5 — Terminal Visualization

**Goal:** make simulation observable from the terminal.

### Initial View

```txt
VGE RUN
step: 128
cost: 0.318
stability: 0.92
constraint violations: 0

+------------------------+
|    .       *           |
|        o      .        |
|  *          @          |
|        .          o    |
+------------------------+
```

### Done When

- visualization runs without external GUI dependencies
- state, cost, and stability are visible
- animation can be disabled for CI

---

## Milestone 6 — Experiment Presets

**Goal:** make repeatable experiments easy.

### Presets

- `single_particle_attractor`
- `two_body_balance`
- `field_relaxation`
- `constraint_collision`
- `chaos_detection`

### Done When

```bash
vge run --preset single_particle_attractor --steps 500 --seed 42
vge run --preset chaos_detection --steps 1000 --report out/report.json
```

---

## First Implementation Sprint

Build in this order:

1. `pyproject.toml`
2. `vge/types.py`
3. `vge/core/state.py`
4. `vge/core/dynamics.py`
5. `vge/core/cost.py`
6. `vge/core/runner.py`
7. `vge/cli.py`
8. tests
9. terminal visualization
10. experiment presets

---

## Minimal CLI Contract

```bash
vge run --steps 200 --seed 42
vge run --preset field_relaxation --steps 500
vge compare --a reports/run_a.json --b reports/run_b.json
vge inspect --report reports/run_a.json
```

---

## Engineering North Star

VGE becomes valuable when it can answer:

```txt
What happened?
Why did it happen?
Was it stable?
Was it reproducible?
Was trajectory B better than trajectory A?
Which variable caused the change?
```

If the engine cannot answer those questions, the next sprint must improve observability before adding complexity.
