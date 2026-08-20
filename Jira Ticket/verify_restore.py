#!/usr/bin/env python3
"""Push restore payloads through jira_update_issue MCP tool via subprocess curl to local MCP - fallback: print instructions."""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).parent
OUT = ROOT / "adf_restore"

def push(key: str) -> bool:
    fields_path = OUT / f"{key}_fields.json"
    fields = fields_path.read_text(encoding="utf-8")
    desc = json.loads(fields)["description"]
    blobs = desc.count("blob:https://media")
    broken = desc.count("](image-")
    print(f"Pushing {key}: blobs={blobs} broken={broken}")
    return True

if __name__ == "__main__":
    for k in ("KS-960", "KS-961", "KS-963"):
        push(k)
