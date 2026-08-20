"""Load MCP invoke args for a ticket key."""
import json
import sys
from pathlib import Path

key = sys.argv[1]
inv = json.loads((Path(__file__).parent / f"{key}_mcp_invoke.json").read_text(encoding="utf-8"))
print(json.dumps(inv["arguments"], separators=(",", ":"), ensure_ascii=False))
