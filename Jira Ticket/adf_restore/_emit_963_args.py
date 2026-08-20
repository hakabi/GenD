import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent
args = json.loads((ROOT / "_963_mcp_tool_args.json").read_text(encoding="utf-8"))
sys.stdout.reconfigure(encoding="utf-8")
sys.stdout.write(json.dumps(args, ensure_ascii=False))
