"""Load _963_mcp_tool_args.json and emit CallMcpTool envelope for agent."""
import json
from pathlib import Path

ROOT = Path(__file__).parent
args = json.loads((ROOT / "_963_mcp_tool_args.json").read_text(encoding="utf-8"))
envelope = {
    "server": "plugin-atlassian-atlassian",
    "toolName": "editJiraIssue",
    "arguments": args,
}
(ROOT / "_963_mcp_envelope_for_call.json").write_text(
    json.dumps(envelope, ensure_ascii=False), encoding="utf-8"
)
print(json.dumps({"envelope_bytes": len(json.dumps(envelope)), "args_bytes": len(json.dumps(args))}))
