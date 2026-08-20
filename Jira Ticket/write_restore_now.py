#!/usr/bin/env python3
"""Write per-ticket editJiraIssue field payloads for MCP push."""
import json
from pathlib import Path

ROOT = Path(__file__).parent / "adf_restore"

for key in ("KS-961", "KS-963"):
    src = ROOT / f"{key}_adf_push.json"
    payload = json.loads(src.read_text(encoding="utf-8"))
    desc = payload["description"]
    out = ROOT / f"_{key.split('-')[1]}_restore_now.json"
    edit = {
        "cloudId": "gendvn.atlassian.net",
        "issueIdOrKey": key,
        "contentFormat": "adf",
        "responseContentFormat": "adf",
        "fields": {"description": desc},
    }
    out.write_text(json.dumps(edit, ensure_ascii=False), encoding="utf-8")
    ms = json.dumps(desc).count("mediaSingle")
    print(f"{key} -> {out.name} mediaSingle={ms} size={out.stat().st_size}")
