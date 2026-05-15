"""PUT merged markdown descriptions to Jira Cloud (REST v3) as ADF via md2adf."""
import json
from pathlib import Path

import md2adf
import requests

ROOT = Path(__file__).resolve().parent
MERGED = ROOT / ".tmp_e3_merged_out"
KEYS = ["KS-978", "KS-979", "KS-980", "KS-981", "KS-982", "KS-983", "KS-993"]

cfg = json.loads((Path.home() / ".cursor" / "mcp.json").read_text(encoding="utf-8"))
env = cfg["mcpServers"]["mcp-atlassian"]["env"]
base_url = env["JIRA_URL"].rstrip("/")
auth = (env["JIRA_USERNAME"], env["JIRA_API_TOKEN"])


def main():
    for key in KEYS:
        md = (MERGED / f"{key}.md").read_text(encoding="utf-8")
        adf = md2adf.convert(md)
        r = requests.put(
            f"{base_url}/rest/api/3/issue/{key}",
            auth=auth,
            json={"fields": {"description": adf}},
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            timeout=120,
        )
        print(key, r.status_code)
        if r.status_code >= 400:
            print(r.text[:1200])


if __name__ == "__main__":
    main()
