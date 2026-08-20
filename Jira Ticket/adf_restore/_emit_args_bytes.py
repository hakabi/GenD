import json
import sys
from pathlib import Path

ROOT = Path(__file__).parent
args = json.loads((ROOT / "KS-963_full_args.json").read_text(encoding="utf-8"))
# Print path for agent; args loaded from KS-963_mcp_payload.json arguments
sys.stdout.buffer.write(json.dumps(args, ensure_ascii=False).encode("utf-8"))
