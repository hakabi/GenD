"""Load KS-963_adf_push.json and write MCP editJiraIssue args for agent invocation."""
import json
from pathlib import Path

ROOT = Path(__file__).parent
push = json.loads((ROOT / "KS-963_adf_push.json").read_text(encoding="utf-8"))
args = {
    "cloudId": "gendvn.atlassian.net",
    "issueIdOrKey": "KS-963",
    "contentFormat": "adf",
    "responseContentFormat": "adf",
    "fields": {"description": push["description"]},
}
(ROOT / "_963_mcp_tool_args.json").write_text(json.dumps(args, ensure_ascii=False), encoding="utf-8")
media = json.dumps(args["fields"]["description"]).count('"type": "mediaSingle"')
print(json.dumps({"ok": True, "mediaSingle": media, "path": str(ROOT / "_963_mcp_tool_args.json")}))
