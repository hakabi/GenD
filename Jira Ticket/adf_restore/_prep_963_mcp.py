"""Invoke editJiraIssue via Cursor agent by printing args path only."""
import json
from pathlib import Path

payload = json.loads(
    (Path(__file__).parent / "KS-963_mcp_payload.json").read_text(encoding="utf-8")
)
args = payload["arguments"]
(Path(__file__).parent / "_963_mcp_args.json").write_text(
    json.dumps(args, ensure_ascii=False), encoding="utf-8"
)
print("READY")
