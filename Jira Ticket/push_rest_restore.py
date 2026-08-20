#!/usr/bin/env python3
"""Push restore payloads to Jira via REST using env creds or emit fields for MCP."""
import json
import os
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).parent / "adf_restore"


def push(key: str) -> int:
    fields = json.loads((ROOT / f"{key}_fields.json").read_text(encoding="utf-8"))
    desc = fields["description"]
    print(f"{key}: blobs={desc.count('blob:https')} broken={desc.count('](image-')}")

    email = os.environ.get("JIRA_EMAIL") or os.environ.get("ATLASSIAN_EMAIL")
    token = os.environ.get("JIRA_API_TOKEN") or os.environ.get("ATLASSIAN_API_TOKEN")
    base = os.environ.get("JIRA_BASE_URL", "https://gendvn.atlassian.net").rstrip("/")

    if not email or not token:
        print(f"{key}: SKIP no creds")
        return 2

    r = requests.put(
        f"{base}/rest/api/3/issue/{key}",
        auth=(email, token),
        headers={"Accept": "application/json", "Content-Type": "application/json"},
        json={"fields": fields},
        timeout=60,
    )
    print(f"{key}: HTTP {r.status_code}")
    if r.status_code >= 400:
        print(r.text[:800])
        return 1
    return 0


if __name__ == "__main__":
    keys = sys.argv[1:] or ["KS-961", "KS-963"]
    rc = 0
    for k in keys:
        rc = max(rc, push(k))
    sys.exit(rc)
