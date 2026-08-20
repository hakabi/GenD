"""Load KS-963_adf_push.json and invoke editJiraIssue via MCP args file."""
import json
from pathlib import Path

ROOT = Path(__file__).parent
push = json.loads((ROOT / "KS-963_adf_push.json").read_text(encoding="utf-8"))
args = {
    "cloudId": "gendvn.atlassian.net",
    "issueIdOrKey": "KS-963",
    "contentFormat": "adf",
    "responseContentFormat": "adf",
    "fields": {"description": push["description"]},
}
out = ROOT / "_963_invoke_args_runtime.json"
out.write_text(json.dumps(args, ensure_ascii=False), encoding="utf-8")
media = json.dumps(args["fields"]["description"]).count('"type": "mediaSingle"')
print(json.dumps({"ok": True, "mediaSingle": media, "bytes": out.stat().st_size}))
