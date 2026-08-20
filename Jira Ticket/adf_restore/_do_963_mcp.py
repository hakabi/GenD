"""Load KS-963 MCP edit args and invoke via Cursor MCP bridge if available."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent
args = json.loads((ROOT / "KS-963_mcp_payload.json").read_text(encoding="utf-8"))["arguments"]

# Emit for agent CallMcpTool: plugin-atlassian-atlassian / editJiraIssue
payload = {
    "server": "plugin-atlassian-atlassian",
    "toolName": "editJiraIssue",
    "arguments": args,
}
out = ROOT / "_963_mcp_invoke_now.json"
out.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
media = json.dumps(args["fields"]["description"]).count('"type": "mediaSingle"')
print(json.dumps({"ok": True, "out": str(out), "bytes": out.stat().st_size, "mediaSingle": media}))
