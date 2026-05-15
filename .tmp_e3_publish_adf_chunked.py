"""Publish issue descriptions as ADF: one paragraph per blank-separated block (Jira-safe)."""
import json
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent
MERGED = ROOT / ".tmp_e3_merged_out"
KEYS = ["KS-978", "KS-979", "KS-980", "KS-981", "KS-982", "KS-983", "KS-993"]

cfg = json.loads((Path.home() / ".cursor" / "mcp.json").read_text(encoding="utf-8"))
env = cfg["mcpServers"]["mcp-atlassian"]["env"]
base_url = env["JIRA_URL"].rstrip("/")
auth = (env["JIRA_USERNAME"], env["JIRA_API_TOKEN"])


def md_to_simple_adf(md: str) -> dict:
    blocks = [b.strip() for b in md.split("\n\n") if b.strip()]
    content = []
    for b in blocks:
        content.append({"type": "paragraph", "content": [{"type": "text", "text": b}]})
    return {"type": "doc", "version": 1, "content": content}


def main():
    for key in KEYS:
        md = (MERGED / f"{key}.md").read_text(encoding="utf-8")
        adf = md_to_simple_adf(md)
        r = requests.put(
            f"{base_url}/rest/api/3/issue/{key}",
            auth=auth,
            json={"fields": {"description": adf}},
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            timeout=120,
        )
        print(key, r.status_code)
        if r.status_code >= 400:
            print(r.text[:800])


if __name__ == "__main__":
    main()
