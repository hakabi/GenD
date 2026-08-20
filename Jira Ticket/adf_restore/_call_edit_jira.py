"""Load MCP edit args JSON and call editJiraIssue via stdin JSON to stdout for agent MCP bridge."""
import json
import sys
from pathlib import Path

path = Path(sys.argv[1])
args = json.loads(path.read_text(encoding="utf-8"))
# Emit single-line JSON for agent to pass to CallMcpTool editJiraIssue
sys.stdout.write(json.dumps(args, ensure_ascii=False))
