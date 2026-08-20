"""Push ADF restore payloads via plugin-atlassian-atlassian MCP editJiraIssue."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent


def load_args(key: str) -> dict:
    push = json.loads((ROOT / f"{key}_adf_push.json").read_text(encoding="utf-8"))
    return {
        "cloudId": "gendvn.atlassian.net",
        "issueIdOrKey": key,
        "contentFormat": "adf",
        "responseContentFormat": "adf",
        "fields": {"description": push["description"]},
    }


def count_media_single(obj) -> int:
    return json.dumps(obj).count('"type": "mediaSingle"')


if __name__ == "__main__":
    key = sys.argv[1] if len(sys.argv) > 1 else "KS-960"
    args = load_args(key)
    out = ROOT / f"{key}_mcp_edit_args.json"
    out.write_text(json.dumps(args, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({
        "key": key,
        "args_file": str(out),
        "payload_mediaSingle": count_media_single(args["fields"]["description"]),
    }))
