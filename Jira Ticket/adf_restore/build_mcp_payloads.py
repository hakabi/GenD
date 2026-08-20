"""Push all ADF restore tickets via plugin-atlassian-atlassian MCP editJiraIssue."""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent
KEYS = ["KS-960", "KS-961", "KS-963"]


def count_media(obj) -> int:
    return json.dumps(obj).count('"type": "mediaSingle"')


def load_args(key: str) -> dict:
    return json.loads((ROOT / f"{key}_call.json").read_text(encoding="utf-8"))


def main() -> int:
    keys = sys.argv[1:] or KEYS
    for key in keys:
        args = load_args(key)
        payload = {
            "server": "plugin-atlassian-atlassian",
            "toolName": "editJiraIssue",
            "arguments": args,
        }
        out = ROOT / f"{key}_mcp_payload.json"
        out.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")
        desc = args["fields"]["description"]
        print(
            json.dumps(
                {
                    "key": key,
                    "payload_file": str(out),
                    "payload_bytes": out.stat().st_size,
                    "content_nodes": len(desc["content"]),
                    "mediaSingle_in_payload": count_media(desc),
                }
            )
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
