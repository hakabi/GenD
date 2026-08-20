"""Load MCP edit args JSON and print path + summary for agent MCP call."""
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
args = json.loads(path.read_text(encoding="utf-8"))
desc = args["fields"]["description"]
media = json.dumps(desc).count("mediaSingle")
content_len = len(desc.get("content", []))
print(json.dumps({
    "cloudId": args["cloudId"],
    "issueIdOrKey": args["issueIdOrKey"],
    "contentFormat": args.get("contentFormat", "adf"),
    "responseContentFormat": args.get("responseContentFormat", "adf"),
    "mediaSingle": media,
    "content_nodes": content_len,
    "args_file": str(path),
}))
