import json
import sys
from pathlib import Path

snap_dir = Path(__file__).with_name(".tmp_jira_v14_snapshots")
desc_dir = Path(__file__).with_name(".tmp_jira_v14_desc")
desc_dir.mkdir(exist_ok=True)

for path in sorted(snap_dir.glob("*.json")):
    data = json.loads(path.read_text(encoding="utf-8"))
    key = data["key"]
    desc = data.get("description") or ""
    (desc_dir / f"{key}.txt").write_text(desc, encoding="utf-8")
    print(f"stored {key} ({len(desc)} chars)")
