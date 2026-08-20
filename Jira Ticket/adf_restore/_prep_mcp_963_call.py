"""Invoke editJiraIssue for KS-963 via MCP args file - used by agent CallMcpTool."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent
payload = json.loads((ROOT / "KS-963_mcp_payload.json").read_text(encoding="utf-8"))
args = payload["arguments"]
# Write args-only for agent to load into CallMcpTool arguments param
(ROOT / "_963_mcp_call_args.json").write_text(
    json.dumps(args, ensure_ascii=False), encoding="utf-8"
)
print(json.dumps({
    "server": payload["server"],
    "toolName": payload["toolName"],
    "args_bytes": len(json.dumps(args)),
    "mediaSingle": json.dumps(args["fields"]["description"]).count('"type": "mediaSingle"'),
}))
