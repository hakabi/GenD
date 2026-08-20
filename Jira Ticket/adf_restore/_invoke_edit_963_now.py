"""Load _963_mcp_tool_args.json and invoke editJiraIssue via MCP HTTP if available."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent
args = json.loads((ROOT / "_963_mcp_tool_args.json").read_text(encoding="utf-8"))
desc = args["fields"]["description"]


def count_media_single(obj, n=0):
    if isinstance(obj, dict):
        if obj.get("type") == "mediaSingle":
            n += 1
        for v in obj.values():
            n = count_media_single(v, n)
    elif isinstance(obj, list):
        for item in obj:
            n = count_media_single(item, n)
    return n


meta = {
    "issueIdOrKey": args["issueIdOrKey"],
    "cloudId": args["cloudId"],
    "payload_bytes": len(json.dumps(args, ensure_ascii=False)),
    "mediaSingle_in_payload": count_media_single(desc),
}
print(json.dumps(meta, indent=2))
