import importlib.util
import json
from pathlib import Path

import requests

MCP_CONFIG = Path.home() / ".cursor" / "mcp.json"
append_path = Path(__file__).with_name(".tmp_jira_v14_append.py")
spec = importlib.util.spec_from_file_location("append_mod", append_path)
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

config = json.loads(MCP_CONFIG.read_text(encoding="utf-8"))
env = config["mcpServers"]["mcp-atlassian"]["env"]
base_url = env["JIRA_URL"].rstrip("/")
auth = (env["JIRA_USERNAME"], env["JIRA_API_TOKEN"])

results = []
for key in mod.KEYS:
    try:
        resp = requests.get(
            f"{base_url}/rest/api/2/issue/{key}",
            auth=auth,
            params={"fields": "description"},
            timeout=60,
        )
        resp.raise_for_status()
        existing = resp.json().get("fields", {}).get("description") or ""
        marker_hit = mod.MARKER in existing or "guide v1.4 (8-tool MCP inventory)" in existing
        if marker_hit:
            results.append({"key": key, "status": "skipped", "note": "marker already present"})
            continue
        merged = existing.rstrip() + mod.build_append(key)
        update = requests.put(
            f"{base_url}/rest/api/2/issue/{key}",
            auth=auth,
            json={"fields": {"description": merged}},
            timeout=60,
        )
        if update.status_code in (200, 204):
            results.append({"key": key, "status": "updated", "note": "appended v1.4 section"})
        else:
            results.append(
                {
                    "key": key,
                    "status": "failed",
                    "note": f"HTTP {update.status_code}: {update.text[:300]}",
                }
            )
    except Exception as exc:
        results.append({"key": key, "status": "failed", "note": str(exc)[:300]})

out_path = Path(__file__).with_name(".tmp_jira_v14_results.json")
out_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
for row in results:
    print(f"{row['key']}\t{row['status']}\t{row['note']}")
