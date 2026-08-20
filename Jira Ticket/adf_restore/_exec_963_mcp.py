"""Execute KS-963 editJiraIssue via MCP using args file - agent uses CallMcpTool with loaded args."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent
args_path = ROOT / "_963_mcp_tool_args.json"
args = json.loads(args_path.read_text(encoding="utf-8"))

if __name__ == "__main__":
    # Print args JSON to stdout for piping; agent should use CallMcpTool instead
    if "--print-args" in sys.argv:
        out = ROOT / "_963_args_stdout.json"
        out.write_text(json.dumps(args, ensure_ascii=False), encoding="utf-8")
        print(str(out), len(json.dumps(args)))
    else:
        print(json.dumps({
            "server": "plugin-atlassian-atlassian",
            "toolName": "editJiraIssue",
            "arguments_path": str(args_path),
            "arguments_bytes": len(json.dumps(args)),
            "issueIdOrKey": args["issueIdOrKey"],
        }))
