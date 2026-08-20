"""Load MCP edit args for a ticket key and print as compact JSON to stdout."""
import json
import sys
from pathlib import Path

key = sys.argv[1]
args = json.loads((Path(__file__).parent / f"{key}_mcp_edit_args.json").read_text(encoding="utf-8"))
print(json.dumps(args, ensure_ascii=False))
