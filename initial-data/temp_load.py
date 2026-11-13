"""Generate and load a fresh, smaller temporary data batch."""

from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEMP = ROOT / "data" / "temp"
STATE = ROOT / "data" / "temp-state.json"
GENERATOR = ROOT / "initial-data" / "generate.py"
TEMP_ID_OFFSET = 10000


def main() -> None:
    state = json.loads(STATE.read_text(encoding="utf-8")) if STATE.exists() else {
        "next_id_offset": TEMP_ID_OFFSET,
        "next_batch": 1,
    }
    id_offset = max(int(state["next_id_offset"]), TEMP_ID_OFFSET)
    if TEMP.exists():
        shutil.rmtree(TEMP)
    TEMP.mkdir(parents=True)

    subprocess.run(
        [
            "uv", "run", "--no-project", "python", str(GENERATOR),
            "--output", str(TEMP),
            "--user-count", "6",
            "--customer-count", "3",
            "--skill-count", "3",
            "--ticket-count", "50",
            "--id-offset", str(id_offset),
            "--batch", str(state["next_batch"]),
        ],
        check=True,
        cwd=ROOT,
    )
    subprocess.run(
        [
            "uv", "run", "--project", "initial-data", "python",
            str(ROOT / "initial-data" / "load.py"), "--input", str(TEMP),
        ],
        check=True,
        cwd=ROOT,
    )
    state["next_id_offset"] = id_offset + 1000
    state["next_batch"] += 1
    STATE.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")
    print(f"Temporary batch loaded from {TEMP}")


if __name__ == "__main__":
    main()
