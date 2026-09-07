"""Command line interface for VGE Engine."""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from vge.core.dynamics import DynamicsConfig
from vge.core.runner import run_simulation
from vge.core.state import EngineState
from vge.viz.terminal import render_report


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="vge", description="Run VGE simulations.")
    subparsers = parser.add_subparsers(dest="command")

    run_parser = subparsers.add_parser("run", help="Run a deterministic simulation")
    run_parser.add_argument("--steps", type=int, default=100)
    run_parser.add_argument("--seed", type=int, default=42)
    run_parser.add_argument("--x", type=float, default=5.0)
    run_parser.add_argument("--y", type=float, default=0.0)
    run_parser.add_argument("--noise", type=float, default=0.0)
    run_parser.add_argument("--report", type=Path, default=None)
    run_parser.add_argument("--json", action="store_true", help="Print JSON instead of terminal view")

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = _build_parser()
    args = parser.parse_args(argv)

    if args.command != "run":
        parser.print_help()
        return 0

    initial_state = EngineState(
        positions=((args.x, args.y),),
        velocities=((0.0, 0.0),),
        field=(1.0,),
        constraints={"boundary": 10.0},
        seed=args.seed,
    )
    report = run_simulation(
        initial_state=initial_state,
        steps=args.steps,
        config=DynamicsConfig(noise=args.noise),
    )
    report_data = report.to_dict()

    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(report_data, indent=2), encoding="utf-8")

    if args.json:
        print(json.dumps(report_data, indent=2))
    else:
        print(render_report(report))

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
