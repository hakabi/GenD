"""Emit editJiraIssue arguments JSON for MCP CallMcpTool (stdout = args only)."""
import json
import sys
from pathlib import Path

args = json.loads(
    (Path(__file__).parent / "_963_call_args_compact.json").read_text(encoding="utf-8")
)
sys.stdout.reconfigure(encoding="utf-8")
sys.stdout.write(json.dumps(args, ensure_ascii=False))
