"""Load _963_mcp_tool_args.json and invoke editJiraIssue via CallMcpTool args file."""
import json
from pathlib import Path

ROOT = Path(__file__).parent
args = json.loads((ROOT / "_963_mcp_tool_args.json").read_text(encoding="utf-8"))
(ROOT / "_963_call_mcp_args_only.json").write_text(
    json.dumps(args, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
)
print(len(json.dumps(args)))
