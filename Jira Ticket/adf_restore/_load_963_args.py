import json
from pathlib import Path

p = Path(__file__).parent / "KS-963_mcp_payload.json"
d = json.loads(p.read_text(encoding="utf-8"))
args = d["arguments"]
s = json.dumps(args, ensure_ascii=False)
print("args_bytes", len(s))
print("mediaSingle_in_payload", s.count('"type": "mediaSingle"'))
