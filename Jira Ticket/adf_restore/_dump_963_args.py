import json
from pathlib import Path

args = json.loads((Path(__file__).parent / "_963_mcp_tool_args.json").read_text(encoding="utf-8"))
(Path(__file__).parent / "_963_args_dump.json").write_text(
    json.dumps(args, ensure_ascii=False), encoding="utf-8"
)
print("dumped", len(json.dumps(args)))
