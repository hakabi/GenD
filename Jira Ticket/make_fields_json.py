import json
from pathlib import Path

OUT = Path(r"d:\source\GenD\Jira Ticket\adf_restore")

for key in ("KS-960", "KS-961", "KS-963"):
    md = (OUT / f"{key}_description.md").read_text(encoding="utf-8")
    payload = {"description": md}
    (OUT / f"{key}_fields.json").write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
    print(key, "chars", len(md), "json", (OUT / f"{key}_fields.json").stat().st_size)
