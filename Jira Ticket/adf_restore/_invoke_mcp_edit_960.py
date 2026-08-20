"""Load editJiraIssue args for KS-960 from prepared JSON file."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent
args_path = ROOT / "_960_restore_now.json"
if not args_path.exists():
    args_path = ROOT / "KS-960_mcp_edit_args.json"

args = json.loads(args_path.read_text(encoding="utf-8"))
desc = args["fields"]["description"]
meta = {
    "source": str(args_path),
    "bytes": len(json.dumps(args)),
    "content_nodes": len(desc.get("content", [])),
    "mediaSingle": json.dumps(desc).count('"type": "mediaSingle"'),
    "headings": json.dumps(desc).count('"type": "heading"'),
}
print(json.dumps({"ok": True, "meta": meta, "args": args}, ensure_ascii=False))
