"""Load MCP edit args JSON and print for agent CallMcpTool invocation."""
import json
import sys
from pathlib import Path

key = sys.argv[1]
args = json.loads((Path(__file__).parent / f"{key}_call.json").read_text(encoding="utf-8"))
# stdout is consumed by agent; also write compact copy
out = Path(__file__).parent / f"{key}_call_compact.json"
out.write_text(json.dumps(args, separators=(",", ":"), ensure_ascii=False), encoding="utf-8")
print(json.dumps(args, separators=(",", ":"), ensure_ascii=False))
