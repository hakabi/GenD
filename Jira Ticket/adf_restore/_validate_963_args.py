import json
from pathlib import Path

def count_media_single(node):
    n = 1 if isinstance(node, dict) and node.get("type") == "mediaSingle" else 0
    if isinstance(node, dict):
        for v in node.values():
            n += count_media_single(v)
    elif isinstance(node, list):
        for item in node:
            n += count_media_single(item)
    return n

path = Path(__file__).parent / "_963_mcp_tool_args.json"
args = json.loads(path.read_text(encoding="utf-8"))
print("keys:", list(args.keys()))
print("size:", len(json.dumps(args)))
print("mediaSingle:", count_media_single(args))
