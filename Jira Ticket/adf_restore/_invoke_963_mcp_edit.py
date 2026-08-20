"""Load KS-963 editJiraIssue args and invoke via subprocess if cursor mcp available."""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent
args = json.loads((ROOT / "_963_mcp_call_args.json").read_text(encoding="utf-8"))
envelope = {
    "server": "plugin-atlassian-atlassian",
    "toolName": "editJiraIssue",
    "arguments": args,
}
out = ROOT / "_963_mcp_invoke_payload.json"
out.write_text(json.dumps(envelope, ensure_ascii=False), encoding="utf-8")
media = json.dumps(args["fields"]["description"]).count('"type": "mediaSingle"')
print(json.dumps({"ok": True, "out": str(out), "mediaSingle": media, "bytes": len(json.dumps(args))}))
