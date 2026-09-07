from vge.core.state import EngineState


def test_state_roundtrip() -> None:
    state = EngineState(
        step=3,
        dt=0.2,
        positions=((1.0, 2.0),),
        velocities=((0.5, -0.1),),
        field=(0.7,),
        constraints={"boundary": 10.0},
        seed=99,
    )

    restored = EngineState.from_dict(state.to_dict())

    assert restored == state


def test_invalid_state_rejected() -> None:
    try:
        EngineState(dt=0)
    except ValueError as exc:
        assert "dt" in str(exc)
    else:
        raise AssertionError("invalid state was accepted")
