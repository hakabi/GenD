import json
from pathlib import Path

args = json.loads((Path(__file__).parent / "_963_mcp_tool_args.json").read_text(encoding="utf-8"))
# Output args JSON for agent CallMcpTool (UTF-8 file, not stdout)
Path(__file__).parent.joinpath("_963_args_for_agent.json").write_text(
    json.dumps(args, ensure_ascii=False), encoding="utf-8"
)
print(json.dumps({"issue": args["issueIdOrKey"], "bytes": len(json.dumps(args))}))
