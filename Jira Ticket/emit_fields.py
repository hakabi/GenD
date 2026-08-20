#!/usr/bin/env python3
"""Emit fields JSON for MCP jira_update_issue calls."""
import json
import sys
from pathlib import Path

key = sys.argv[1]
path = Path(__file__).parent / "adf_restore" / f"{key}_fields.json"
print(path.read_text(encoding="utf-8"))
