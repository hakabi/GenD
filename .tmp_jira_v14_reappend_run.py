import json
import subprocess
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent
REAPPEND = ROOT / ".tmp_jira_v14_reappend.py"
TEMP_DIR = ROOT / ".tmp_jira_v14_reappend_desc"
PAYLOAD_DIR = ROOT / ".tmp_jira_v14_reappend_payloads"
TEMP_DIR.mkdir(exist_ok=True)
PAYLOAD_DIR.mkdir(exist_ok=True)

config = json.loads((Path.home() / ".cursor" / "mcp.json").read_text(encoding="utf-8"))
env = config["mcpServers"]["mcp-atlassian"]["env"]
base_url = env["JIRA_URL"].rstrip("/")
auth = (env["JIRA_USERNAME"], env["JIRA_API_TOKEN"])

keys = json.loads(subprocess.check_output([sys.executable, str(REAPPEND), "keys"], text=True))
summary = []

for key in keys:
    try:
        resp = requests.get(
            f"{base_url}/rest/api/2/issue/{key}",
            auth=auth,
            params={"fields": "description"},
            timeout=60,
        )
        resp.raise_for_status()
        existing = resp.json().get("fields", {}).get("description") or ""
        temp_file = TEMP_DIR / f"{key}.txt"
        temp_file.write_text(existing, encoding="utf-8")
        merged = json.loads(
            subprocess.check_output(
                [sys.executable, str(REAPPEND), "merge", str(temp_file), key],
                text=True,
            )
        )
        fields = json.dumps({"description": merged["description"]}, ensure_ascii=False)
        (PAYLOAD_DIR / f"{key}.fields.json").write_text(fields, encoding="utf-8")
        summary.append({"key": key, "status": "ready", "note": "payload ready"})
    except Exception as exc:
        summary.append({"key": key, "status": "failed", "note": str(exc)[:300]})

(ROOT / ".tmp_jira_v14_reappend_summary.json").write_text(
    json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8"
)
for row in summary:
    print(f"{row['key']}\t{row['status']}\t{row['note']}")
