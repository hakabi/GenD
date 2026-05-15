import json
import subprocess
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent
REAPPEND = ROOT / ".tmp_jira_v14_reappend.py"
PAYLOAD_DIR = ROOT / ".tmp_jira_v14_reappend_payloads"

config = json.loads((Path.home() / ".cursor" / "mcp.json").read_text(encoding="utf-8"))
env = config["mcpServers"]["mcp-atlassian"]["env"]
base_url = env["JIRA_URL"].rstrip("/")
auth = (env["JIRA_USERNAME"], env["JIRA_API_TOKEN"])

keys = json.loads(subprocess.check_output([sys.executable, str(REAPPEND), "keys"], text=True))
results = []

for key in keys:
  payload_path = PAYLOAD_DIR / f"{key}.fields.json"
  try:
    fields = json.loads(payload_path.read_text(encoding="utf-8"))
    resp = requests.put(
      f"{base_url}/rest/api/2/issue/{key}",
      auth=auth,
      json={"fields": fields},
      timeout=120,
    )
    if resp.status_code in (200, 204):
      results.append({"key": key, "status": "updated", "note": "plain v1.4 block applied"})
    else:
      results.append(
        {
          "key": key,
          "status": "failed",
          "note": f"HTTP {resp.status_code}: {resp.text[:200]}",
        }
      )
  except Exception as exc:
    results.append({"key": key, "status": "failed", "note": str(exc)[:200]})

(ROOT / ".tmp_jira_v14_reappend_results.json").write_text(
  json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
)
for row in results:
  print(f"{row['key']}\t{row['status']}\t{row['note']}")
