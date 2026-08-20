import json
from pathlib import Path

ROOT = Path(__file__).parent
args = json.loads(ROOT.joinpath("_mcp_tool_args_line.json").read_text(encoding="utf-8"))
payload = {
    "server": "plugin-atlassian-atlassian",
    "toolName": "editJiraIssue",
    "arguments": args,
}
ROOT.joinpath("_mcp_call_edit_960.json").write_text(
    json.dumps(payload, ensure_ascii=False), encoding="utf-8"
)
print("written", ROOT / "_mcp_call_edit_960.json", "args_bytes", len(json.dumps(args)))
