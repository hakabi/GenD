import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REAPPEND = ROOT / ".tmp_jira_v14_reappend.py"
DESC_JSON = ROOT / ".tmp_jira_v14_reappend_descriptions.json"
OUT_JSON = ROOT / ".tmp_jira_v14_reappend_payloads.json"
TEMP_DIR = ROOT / ".tmp_jira_v14_reappend_desc"
TEMP_DIR.mkdir(exist_ok=True)

descriptions = json.loads(DESC_JSON.read_text(encoding="utf-8"))
keys = json.loads(subprocess.check_output([sys.executable, str(REAPPEND), "keys"], text=True))

payloads = {}
for key in keys:
    existing = descriptions.get(key)
    if existing is None:
        payloads[key] = {"status": "failed", "note": "description missing from input"}
        continue
    temp_file = TEMP_DIR / f"{key}.txt"
    temp_file.write_text(existing, encoding="utf-8")
    merged = json.loads(
        subprocess.check_output(
            [sys.executable, str(REAPPEND), "merge", str(temp_file), key],
            text=True,
        )
    )
    payloads[key] = {
        "status": "ready",
        "fields": json.dumps({"description": merged["description"]}, ensure_ascii=False),
    }

OUT_JSON.write_text(json.dumps(payloads, ensure_ascii=False, indent=2), encoding="utf-8")
for key in keys:
    row = payloads[key]
    print(f"{key}\t{row['status']}\t{row.get('note', 'payload ready')}")
