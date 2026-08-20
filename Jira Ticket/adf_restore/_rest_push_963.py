"""Push KS-963 ADF description via Jira REST API (fallback when MCP args too large)."""
import json
import os
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).parent
args = json.loads((ROOT / "_963_mcp_tool_args.json").read_text(encoding="utf-8"))
fields = args["fields"]
key = args["issueIdOrKey"]

email = os.environ.get("JIRA_EMAIL") or os.environ.get("ATLASSIAN_EMAIL")
token = os.environ.get("JIRA_API_TOKEN") or os.environ.get("ATLASSIAN_API_TOKEN")
base = os.environ.get("JIRA_BASE_URL", "https://gendvn.atlassian.net").rstrip("/")

if not email or not token:
    print(json.dumps({"ok": False, "error": "no creds", "mediaSingle": json.dumps(fields["description"]).count('"type": "mediaSingle"')}))
    sys.exit(2)

r = requests.put(
    f"{base}/rest/api/3/issue/{key}",
    auth=(email, token),
    headers={"Accept": "application/json", "Content-Type": "application/json"},
    json={"fields": fields},
    timeout=120,
)
media = json.dumps(fields["description"]).count('"type": "mediaSingle"')
print(json.dumps({"ok": r.status_code < 400, "status": r.status_code, "mediaSingle": media, "body": r.text[:500]}))
sys.exit(0 if r.status_code < 400 else 1)
