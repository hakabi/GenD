#!/usr/bin/env python3
"""Update Jira issues from adf_restore/*_fields.json using Atlassian MCP-compatible markdown."""
import json
import sys
from pathlib import Path

# This script validates payloads; actual push is via Cursor MCP jira_update_issue.
ROOT = Path(__file__).parent / "adf_restore"

def main():
    keys = sys.argv[1:] or ["KS-960", "KS-961", "KS-963"]
    for key in keys:
        p = ROOT / f"{key}_fields.json"
        data = json.loads(p.read_text(encoding="utf-8"))
        desc = data["description"]
        print(json.dumps({
            "issue_key": key,
            "blob_count": desc.count("blob:https://media"),
            "broken_count": desc.count("](image-"),
            "char_count": len(desc),
        }))

if __name__ == "__main__":
    main()
