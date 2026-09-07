from vge.cli import main


def test_cli_run_smoke(capsys) -> None:
    exit_code = main(["run", "--steps", "2"])
    output = capsys.readouterr().out

    assert exit_code == 0
    assert "VGE RUN" in output
    assert "cost:" in output
