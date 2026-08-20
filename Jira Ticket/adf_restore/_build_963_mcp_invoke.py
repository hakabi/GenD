"""Load _963_mcp_tool_args.json and invoke editJiraIssue via plugin MCP using stdio bridge."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent
args = json.loads((ROOT / "_963_mcp_tool_args.json").read_text(encoding="utf-8"))

def count_media_single(node):
    n = 1 if isinstance(node, dict) and node.get("type") == "mediaSingle" else 0
    if isinstance(node, dict):
        for v in node.values():
            n += count_media_single(v)
    elif isinstance(node, list):
        for item in node:
            n += count_media_single(item)
    return n

if __name__ == "__main__":
    payload_media = count_media_single(args["fields"]["description"])
    result = {
        "action": "CallMcpTool",
        "server": "plugin-atlassian-atlassian",
        "toolName": "editJiraIssue",
        "arguments": args,
        "verify": {
            "payload_bytes": len(json.dumps(args)),
            "payload_mediaSingle": payload_media,
            "issueIdOrKey": args["issueIdOrKey"],
        },
    }
    out = ROOT / "_963_mcp_invoke_payload_final.json"
    out.write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(result["verify"]))
