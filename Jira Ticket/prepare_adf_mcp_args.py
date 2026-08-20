#!/usr/bin/env python3
"""Push ADF description restore via Atlassian MCP editJiraIssue (stdin JSON)."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent / "adf_restore"
CLOUD = "gendvn.atlassian.net"


def load_desc(key: str) -> dict:
    payload = json.loads((ROOT / f"{key}_adf_push.json").read_text(encoding="utf-8"))
    return payload["description"]


def main():
    keys = sys.argv[1:] or ["KS-960", "KS-961", "KS-963"]
    for key in keys:
        desc = load_desc(key)
        ms = json.dumps(desc).count('"type": "mediaSingle"')
        out = {
            "cloudId": CLOUD,
            "issueIdOrKey": key,
            "contentFormat": "adf",
            "responseContentFormat": "adf",
            "fields": {"description": desc},
            "_meta": {"mediaSingle": ms, "bytes": len(json.dumps(desc))},
        }
        print(json.dumps({"key": key, "mediaSingle": ms, "ready": True}))


if __name__ == "__main__":
    main()
