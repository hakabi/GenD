"""Push KS-963 ADF description via plugin-atlassian editJiraIssue (run from agent CallMcpTool)."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent
args_path = ROOT / "_963_for_mcp.json"
args = json.loads(args_path.read_text(encoding="utf-8"))

# Emit machine-readable summary for agent; full args stay in _963_for_mcp.json
summary = {
    "action": "CallMcpTool",
    "server": "plugin-atlassian-atlassian",
    "toolName": "editJiraIssue",
    "arguments_file": str(args_path),
    "issueIdOrKey": args["issueIdOrKey"],
    "mediaSingle": json.dumps(args["fields"]["description"]).count("mediaSingle"),
    "bytes": args_path.stat().st_size,
}
print(json.dumps(summary))
