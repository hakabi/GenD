"""Load editJiraIssue args from KS-960_adf_push.json and emit MCP call metadata."""
import json
from pathlib import Path

ROOT = Path(__file__).parent
push = json.loads((ROOT / "KS-960_adf_push.json").read_text(encoding="utf-8"))
args = {
    "cloudId": "gendvn.atlassian.net",
    "issueIdOrKey": "KS-960",
    "contentFormat": "adf",
    "responseContentFormat": "adf",
    "fields": {"description": push["description"]},
}
(ROOT / "_960_mcp_tool_args.json").write_text(
    json.dumps(args, ensure_ascii=False), encoding="utf-8"
)
print(json.dumps({"ok": True, "bytes": len(json.dumps(args)), "issue": "KS-960"}))
